"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Newspaper, Bell, ExternalLink, RefreshCcw, Zap, User, Lightbulb } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { SignInButton, useClerk } from "@clerk/nextjs";

// --- [반도체 기술 키워드 하이라이트] ---
const SEMI_KEYWORDS = ["HBM", "EUV", "파운드리", "TSV", "CXL", "노광", "식각", "증착", "ALD", "유리기판", "전공정", "후공정"];

const highlightKeywords = (title: string) => {
  let highlighted = title;
  SEMI_KEYWORDS.forEach(word => {
    if (title.includes(word)) {
      highlighted = highlighted.replace(
        new RegExp(word, 'g'), 
        `<span class="text-blue-400 font-black drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]">${word}</span>`
      );
    }
  });
  return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
};

const isCriticalDisclosure = (name: string) => {
  const criticalWords = ["공급계약", "시설투자", "유상증자", "합병", "취득결정"];
  return criticalWords.some(word => name.includes(word));
};

// --- [UI 스켈레톤] ---
const NewsSkeleton = () => (
  <div className="bg-[#151518] p-4 rounded-xl border border-gray-900 animate-pulse">
    <div className="h-3 bg-gray-800 rounded w-3/4 mb-3"></div>
    <div className="h-2 bg-gray-800/50 rounded w-1/4"></div>
  </div>
);

const DartSkeleton = () => (
  <div className="bg-[#151518] p-4 rounded-xl border border-gray-900 animate-pulse">
    <div className="h-2 bg-gray-800 rounded w-1/2 mb-3"></div>
    <div className="h-3 bg-gray-800 rounded w-full mb-3"></div>
    <div className="h-6 bg-gray-800/30 rounded-lg w-full"></div>
  </div>
);

export default function Home() {
  const { openSignIn } = useClerk();

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("반도체");
  const [news, setNews] = useState([]);
  const [disclosures, setDisclosures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  // --- [데이터 기반 실시간 요약 엔진] ---
  const aiAnalysis = useMemo(() => {
    const allTitles = [...news.map((n: any) => n.title), ...disclosures.map((d: any) => d.report_nm)].join(" ");
    const hotKeyword = SEMI_KEYWORDS.find(kw => allTitles.includes(kw)) || "반도체 소부장";
    const criticalCount = disclosures.filter((d: any) => isCriticalDisclosure(d.report_nm)).length;

    return {
      title: `${hotKeyword} 중심의 시장 흐름 포착`,
      content: criticalCount > 0 
        ? `현재 ${hotKeyword} 분야에서 ${criticalCount}건의 주요 공시가 포착되었습니다. 대규모 공급계약이나 시설투자 여부를 리포트에서 확인하세요.`
        : `섹터 내 뚜렷한 공시는 없으나 ${hotKeyword} 관련 뉴스 유입이 증가하고 있습니다. 기술적 반등 및 수급 변화에 유의하세요.`,
      target: hotKeyword
    };
  }, [news, disclosures]);

  useEffect(() => {
    setMounted(true);
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const fetchAllData = useCallback(async (query: string) => {
    if (!query) return;
    setLoading(true);
    try {
      const [newsRes, dartRes] = await Promise.all([
        fetch(`/api/news?query=${encodeURIComponent(query)}`),
        fetch(`/api/dart?query=${encodeURIComponent(query)}`)
      ]);
      const newsData = await newsRes.json();
      const dartData = await dartRes.json();
      setNews(newsData.articles?.slice(0, 8) || []);
      setDisclosures(dartData.list || []);
      setLastUpdated(new Date());
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllData(activeTab);
  }, [activeTab, fetchAllData]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white p-3 md:p-8 font-sans selection:bg-blue-500/30 relative">

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-end mb-4">
          {user ? (
            <div className="flex items-center gap-3 bg-[#151518] px-4 py-2 rounded-full border border-gray-800">
              <span className="text-[10px] font-bold text-blue-400 flex items-center gap-2"><User size={12}/> {user.email?.split('@')[0]}님</span>
              <button onClick={handleLogout} className="text-[10px] text-gray-500 font-black hover:text-white transition-colors uppercase">Logout</button>
            </div>
          ) : (
            /* Clerk 인터럽트 모달을 바로 띄우도록 설정 */
            <SignInButton mode="modal" fallbackRedirectUrl="/">
              <button className="bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-full text-[11px] font-black uppercase shadow-lg shadow-blue-600/20 transition-all active:scale-95 cursor-pointer">
                Login / Join
              </button>
            </SignInButton>
          )}
        </div>

        <header className="flex flex-col items-center py-6 md:py-10">
          <div className="bg-blue-600/10 text-blue-500 text-[10px] font-black px-3 py-1 rounded mb-4 border border-blue-500/20 flex items-center gap-2 tracking-tighter uppercase">
            <Zap size={10} fill="currentColor" /> Semi-conductor Insight Provider
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic mb-2 text-center uppercase">
            STOCKDATA <span className="text-blue-500">PRO</span>
          </h1>
          <div className="flex items-center gap-2 text-gray-600 text-[10px] font-medium mt-2">
            <RefreshCcw size={10} className={loading ? "animate-spin" : ""} />
            실시간 업데이트 중: {lastUpdated.toLocaleTimeString()}
          </div>
        </header>

        {/* --- [AI 요약 & 분석 섹션] --- */}
        <section className="mb-8 px-1">
          <div className="bg-[#151518] rounded-3xl border border-gray-800 p-6 md:p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] -z-10 group-hover:bg-blue-600/10 transition-colors"></div>
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-blue-600 p-2 rounded-lg"><Lightbulb size={18} className="text-white" /></div>
              <span className="text-blue-500 font-black text-xs uppercase italic tracking-widest">Today&apos;s AI Briefing</span>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl md:text-4xl font-black tracking-tighter italic text-white uppercase leading-tight">
                {aiAnalysis.title}
              </h2>
              <p className="text-gray-400 text-sm md:text-lg font-medium leading-relaxed max-w-3xl">
                {aiAnalysis.content}
              </p>
              <div className="pt-4 flex gap-3">
                <span className="px-4 py-1.5 bg-blue-600/10 border border-blue-500/30 rounded-full text-blue-400 text-[10px] font-black uppercase">
                  #{aiAnalysis.target}
                </span>
                <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-gray-400 text-[10px] font-black uppercase">
                  #실시간분석
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* --- [카테고리 탭] --- */}
        <div className="mb-10 max-w-xl mx-auto px-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {["반도체", "2차전지", "AI/SW", "로봇", "자동차"].map((tab) => (
              <button key={tab} onClick={() => { setActiveTab(tab); fetchAllData(tab); }} className={`px-6 py-3 rounded-xl text-[11px] font-black whitespace-nowrap transition-all uppercase tracking-tighter ${activeTab === tab ? "bg-white text-black scale-105 shadow-xl shadow-white/5" : "bg-[#151518] text-gray-500 hover:text-gray-300"}`}>{tab}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-1">
          {/* 뉴스 섹션 */}
          <section>
            <div className="flex items-center gap-2 mb-6 border-b border-gray-800 pb-3">
              <Newspaper size={16} className="text-blue-500" />
              <h2 className="text-xl font-black italic uppercase tracking-tight">Main News</h2>
            </div>
            <div className="space-y-4">
              {loading ? Array(4).fill(0).map((_, i) => <NewsSkeleton key={i} />) : 
                news.map((item: any, idx) => (
                <div key={idx} className="group bg-[#151518] p-5 rounded-2xl border border-gray-900 flex flex-col justify-between hover:border-blue-500/40 transition-all hover:-translate-y-1">
                  <h3 className="font-bold text-sm md:text-lg leading-snug text-gray-100 group-hover:text-white transition-colors">{highlightKeywords(item.title)}</h3>
                  <a href={item.url} target="_blank" className="text-[10px] font-black text-blue-500 mt-4 flex items-center gap-1 uppercase tracking-widest opacity-70 group-hover:opacity-100">Read Article <ExternalLink size={10} /></a>
                </div>
              ))}
            </div>
          </section>

          {/* 공시 섹션 */}
          <section>
            <div className="flex items-center gap-2 mb-6 border-b border-gray-800 pb-3">
              <Bell size={16} className="text-red-500" />
              <h2 className="text-xl font-black italic uppercase tracking-tight">Dart Alert</h2>
            </div>
            <div className="space-y-4">
              {loading ? Array(4).fill(0).map((_, i) => <DartSkeleton key={i} />) : 
                disclosures.slice(0, 8).map((item: any, idx) => {
                  const critical = isCriticalDisclosure(item.report_nm);
                  return (
                    <div key={idx} className={`bg-[#151518] p-5 rounded-2xl border-2 ${critical ? 'border-red-600/40 bg-red-600/5' : 'border-gray-900'} flex flex-col justify-between hover:border-red-500/50 transition-all`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-[11px] font-black px-2 py-0.5 rounded ${critical ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'}`}>{item.corp_name}</span>
                        <span className="text-[10px] text-gray-600 font-mono">{item.rcept_dt}</span>
                      </div>
                      <h3 className={`font-bold text-xs md:text-sm mb-4 leading-relaxed ${critical ? 'text-white' : 'text-gray-400'}`}>{item.report_nm}</h3>
                      <a href={`https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${item.rcept_no}`} target="_blank" className={`text-center py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${critical ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-white/5 text-gray-500 border border-white/10 hover:bg-white/10 hover:text-gray-300'}`}>Official Report</a>
                    </div>
                  );
                })}
            </div>
          </section>
        </div>
      </div>
      <footer className="text-center py-24 text-gray-800 font-black text-[10px] uppercase tracking-[0.3em]">
        Designated for Daelim Univ. Semiconductor Dept | 2026 StockData Pro
      </footer>
    </main>
  );
}