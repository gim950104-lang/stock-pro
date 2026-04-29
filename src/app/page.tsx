"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, Newspaper, Bell, ExternalLink, Star, RefreshCcw, Zap, TrendingUp, X } from "lucide-react";

// --- [PRO] 반도체 기술 키워드 및 로직 ---
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

// --- [UI] 스켈레톤 컴포넌트 ---
const NewsSkeleton = () => (
  <div className="bg-[#151518] p-5 rounded-2xl border border-gray-900 animate-pulse">
    <div className="h-4 bg-gray-800 rounded w-3/4 mb-4"></div>
    <div className="h-3 bg-gray-800/50 rounded w-1/4"></div>
  </div>
);

const DartSkeleton = () => (
  <div className="bg-[#151518] p-5 rounded-2xl border border-gray-900 border-l-4 border-l-gray-800 animate-pulse">
    <div className="flex justify-between mb-3"><div className="h-3 bg-gray-800 rounded w-16"></div><div className="h-3 bg-gray-800/50 rounded w-12"></div></div>
    <div className="h-4 bg-gray-800 rounded w-full mb-5"></div>
    <div className="h-10 bg-gray-800/30 rounded-xl w-full"></div>
  </div>
);

export default function Home() {
  const [activeTab, setActiveTab] = useState("반도체");
  const [searchQuery, setSearchQuery] = useState("");
  const [news, setNews] = useState([]);
  const [disclosures, setDisclosures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [myFavorites, setMyFavorites] = useState<string[]>([]);
  const [showBriefing, setShowBriefing] = useState(true);

  const categories = ["반도체", "2차전지", "AI/SW", "로봇", "자동차"];

  useEffect(() => {
    const saved = localStorage.getItem("stock-pro-favorites");
    if (saved) setMyFavorites(JSON.parse(saved));
  }, []);

  const toggleFavorite = (corp: string) => {
    if (!corp) return;
    let updated = myFavorites.includes(corp) ? myFavorites.filter(f => f !== corp) : [corp, ...myFavorites].slice(0, 8);
    setMyFavorites(updated);
    localStorage.setItem("stock-pro-favorites", JSON.stringify(updated));
  };

  const fetchAllData = useCallback(async (query: string) => {
    if (!query) return;
    setLoading(true);
    try {
      const newsRes = await fetch(`/api/news?query=${encodeURIComponent(query)}`);
      const newsData = await newsRes.json();
      setNews(newsData.articles?.slice(0, 6) || []);
      const dartRes = await fetch(`/api/dart?query=${encodeURIComponent(query)}`);
      const dartData = await dartRes.json();
      setDisclosures(dartData.list || []);
      setLastUpdated(new Date());
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllData(activeTab);
    const timer = setInterval(() => fetchAllData(activeTab), 300000); 
    return () => clearInterval(timer);
  }, [activeTab, fetchAllData]);

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white p-4 md:p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto">
        
        {/* 헤더 */}
        <header className="flex flex-col items-center py-10">
          <div className="bg-blue-600/10 text-blue-500 text-[10px] font-black px-3 py-1 rounded mb-4 tracking-widest border border-blue-500/20 flex items-center gap-2">
            <Zap size={10} fill="currentColor" /> SEMI-CONDUCTOR PRO ACTIVE
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic mb-3 text-center uppercase">
            STOCKDATA <span className="text-blue-500">PRO</span>
          </h1>
          <div className="flex items-center gap-2 text-gray-600 text-[11px] font-medium">
            <RefreshCcw size={12} className={loading ? "animate-spin" : ""} />
            Terminal Synced: {lastUpdated.toLocaleTimeString()}
          </div>
        </header>

        {/* 1. SEMI-Heatmap 섹션 */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4 text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">
            <TrendingUp size={14} className="text-blue-500" /> Sector Heatmap
          </div>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2 h-48 md:h-32">
            <div className="col-span-2 row-span-2 md:row-span-1 bg-blue-600 rounded-2xl p-4 flex flex-col justify-end border border-white/10 hover:bg-blue-500 transition-all cursor-pointer shadow-lg shadow-blue-900/20">
              <span className="text-[10px] font-bold opacity-70 uppercase">High Bandwidth</span>
              <span className="font-black text-xl italic">HBM 3E</span>
            </div>
            <div className="col-span-2 bg-[#151518] rounded-2xl p-4 flex flex-col justify-end border border-gray-800 hover:border-gray-600 transition-all cursor-pointer">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Foundry</span>
              <span className="font-black text-sm">2nm Process</span>
            </div>
            <div className="bg-green-900/30 rounded-2xl p-4 flex flex-col justify-end border border-green-500/20">
              <span className="text-[8px] font-black text-green-500 uppercase">Focus</span>
              <span className="font-black text-xs uppercase text-green-200">OSAT</span>
            </div>
            <div className="bg-red-900/20 rounded-2xl p-4 flex flex-col justify-end border border-red-500/20 opacity-60">
              <span className="text-[8px] font-black text-red-500 uppercase">Short</span>
              <span className="font-black text-xs uppercase text-red-200">Legacy</span>
            </div>
          </div>
        </section>

        {/* 2. 출근길 60초 Briefing */}
        {showBriefing && (
          <section className="mb-12 bg-gradient-to-br from-blue-950/30 to-[#151518] border border-blue-500/20 rounded-[2rem] p-6 md:p-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 opacity-5 rotate-12"><Newspaper size={200} /></div>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3 bg-blue-600 px-4 py-1.5 rounded-full text-[11px] font-black uppercase shadow-lg shadow-blue-600/20">
                <Zap size={14} fill="white" /> 60s Briefing
              </div>
              <button onClick={() => setShowBriefing(false)} className="text-gray-600 hover:text-white transition-colors"><X size={20}/></button>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl md:text-2xl font-bold leading-tight">"장비 유지보수 엔지니어라면 오늘 <span className="text-blue-400">평택 P4 신규 라인</span> 공시를 주목하세요"</h3>
              <p className="text-gray-400 text-sm md:text-base font-medium leading-relaxed max-w-2xl">
                최근 삼성전자의 설비투자 공시에 따르면 증착 공정 장비 입고가 앞당겨졌습니다. 이는 유지보수 수요 급증으로 이어질 가능성이 큽니다.
              </p>
            </div>
          </section>
        )}

        {/* 검색창 */}
        <div className="mb-12 max-w-xl mx-auto px-2">
          <form onSubmit={(e) => { e.preventDefault(); if(searchQuery.trim()) { setActiveTab(searchQuery.trim()); fetchAllData(searchQuery.trim()); } }} className="relative group mb-6">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="기업명 혹은 기술 키워드 검색" className="w-full bg-[#151518] border-2 border-gray-900 rounded-[1.5rem] pl-16 pr-8 py-5 text-sm focus:outline-none focus:border-blue-500/50 transition-all shadow-2xl shadow-black" />
          </form>
          {activeTab && !categories.includes(activeTab) && (
            <div className="flex justify-center">
              <button onClick={() => toggleFavorite(activeTab)} className={`flex items-center gap-2 px-6 py-2 rounded-full border-2 text-[11px] font-black tracking-tighter transition-all ${myFavorites.includes(activeTab) ? "border-yellow-500/50 text-yellow-500 bg-yellow-500/5 shadow-lg shadow-yellow-500/5" : "border-gray-800 text-gray-500"}`}>
                <Star size={14} fill={myFavorites.includes(activeTab) ? "currentColor" : "none"} /> {myFavorites.includes(activeTab) ? "SAVED TO DASHBOARD" : `SAVE '${activeTab.toUpperCase()}'`}
              </button>
            </div>
          )}
        </div>

        {/* 네비게이션 */}
        <nav className="mb-16 space-y-8">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:justify-center px-2">
            {categories.map((tab) => (
              <button key={tab} onClick={() => { setActiveTab(tab); fetchAllData(tab); }} className={`px-8 py-3 rounded-2xl text-[11px] font-black transition-all whitespace-nowrap ${activeTab === tab ? "bg-white text-black scale-105 shadow-xl shadow-white/5" : "bg-[#151518] text-gray-500 hover:text-gray-300"}`}>{tab}</button>
            ))}
          </div>
          {myFavorites.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center px-4 pt-8 border-t border-gray-900">
              {myFavorites.map((corp) => (
                <button key={corp} onClick={() => { setActiveTab(corp); fetchAllData(corp); }} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black transition-all border-2 ${activeTab === corp ? "border-blue-500 bg-blue-500/10 text-blue-500" : "border-gray-800 bg-[#151518]/50 text-gray-600 hover:border-gray-600"}`}>
                  <Star size={12} fill="currentColor" className="text-yellow-600" />{corp}
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* 컨텐츠 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <section className="px-2">
            <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-5">
              <div className="flex items-center gap-3"><Newspaper className="text-blue-500" size={24} /><h2 className="text-2xl font-black italic">TECH NEWS</h2></div>
            </div>
            <div className="space-y-5">
              {loading ? Array(4).fill(0).map((_, i) => <NewsSkeleton key={i} />) : 
                news.map((item: any, idx) => (
                <div key={idx} className="group bg-[#151518] p-6 rounded-3xl border border-gray-900 hover:border-blue-500/30 transition-all shadow-lg hover:shadow-blue-500/5">
                  <h3 className="font-bold text-base md:text-lg mb-5 leading-snug text-gray-100 group-hover:text-blue-400 transition-colors">
                    {highlightKeywords(item.title)}
                  </h3>
                  <a href={item.url} target="_blank" className="inline-flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline underline-offset-4">ANALYZE FULL STORY <ExternalLink size={12} /></a>
                </div>
              ))}
            </div>
          </section>

          <section className="px-2">
            <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-5">
              <div className="flex items-center gap-3"><Bell className="text-red-600" size={24} /><h2 className="text-2xl font-black italic">DART FEED</h2></div>
            </div>
            <div className="space-y-5">
              {loading ? Array(4).fill(0).map((_, i) => <DartSkeleton key={i} />) : 
                disclosures.map((item: any, idx) => {
                  const critical = isCriticalDisclosure(item.report_nm);
                  return (
                    <div key={idx} className={`bg-[#151518] p-6 rounded-3xl border-2 ${critical ? 'border-red-600/40 shadow-2xl shadow-red-950/20' : 'border-gray-900'} transition-all`}>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-[12px] font-black ${critical ? 'text-red-500' : 'text-gray-500'}`}>{item.corp_name}</span>
                          {critical && <span className="flex h-2 w-2"><span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>}
                        </div>
                        <span className="text-[10px] text-gray-600 font-mono font-bold tracking-tighter">{item.rcept_dt}</span>
                      </div>
                      <h3 className={`font-bold text-sm md:text-base mb-6 leading-relaxed ${critical ? 'text-white' : 'text-gray-400'}`}>{item.report_nm}</h3>
                      <a href={`https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${item.rcept_no}`} target="_blank" className={`block text-center py-4 rounded-2xl text-[10px] font-black uppercase transition-all ${critical ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-red-600/10 text-red-500 hover:bg-red-600/20 border border-red-600/30'}`}>
                        {critical ? '⚡ Critical Disclosure Detected' : 'Review Report'}
                      </a>
                    </div>
                  );
                })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}