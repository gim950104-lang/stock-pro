"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  RefreshCcw,
  Zap,
  Lightbulb,
  Search,
  Newspaper,
  BellRing,
} from "lucide-react";

// --- [반도체 기술 키워드] ---
const SEMI_KEYWORDS = [
  "HBM",
  "EUV",
  "파운드리",
  "TSV",
  "CXL",
  "노광",
  "식각",
  "증착",
  "ALD",
  "유리기판",
  "전공정",
  "후공정",
];

const isCriticalDisclosure = (name: string) => {
  const criticalWords = ["공급계약", "시설투자", "유상증자", "합병", "취득결정"];
  return criticalWords.some((word) => name.includes(word));
};

export default function Home() {
  const { isSignedIn } = useUser();

  const [activeTab, setActiveTab] = useState("반도체");
  const [news, setNews] = useState<any[]>([]);
  const [disclosures, setDisclosures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const aiAnalysis = useMemo(() => {
    const allTitles = [
      ...news.map((n: any) => n.title),
      ...disclosures.map((d: any) => d.report_nm),
    ].join(" ");

    const hotKeyword =
      SEMI_KEYWORDS.find((kw) => allTitles.includes(kw)) || "반도체 소부장";

    const criticalCount = disclosures.filter((d: any) =>
      isCriticalDisclosure(d.report_nm)
    ).length;

    return {
      title: `${hotKeyword} 중심의 시장 흐름 포착`,
      content:
        criticalCount > 0
          ? `현재 ${hotKeyword} 분야에서 ${criticalCount}건의 주요 공시가 포착되었습니다. 대규모 공급계약이나 시설투자 여부를 리포트에서 확인하세요.`
          : `섹터 내 뚜렷한 공시는 없으나 ${hotKeyword} 관련 뉴스 유입이 증가하고 있습니다. 기술적 반등 및 수급 변화에 유의하세요.`,
    };
  }, [news, disclosures]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchAllData = useCallback(async (query: string) => {
    if (!query) return;

    setLoading(true);

    try {
      const [newsRes, dartRes] = await Promise.all([
        fetch(`/api/news?query=${encodeURIComponent(query)}`),
        fetch(`/api/dart?query=${encodeURIComponent(query)}`),
      ]);

      const newsData = await newsRes.json();
      const dartData = await dartRes.json();

      setNews(newsData.articles?.slice(0, 12) || []);
      setDisclosures(dartData.list?.slice(0, 12) || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllData(activeTab);

    const interval = setInterval(() => {
      fetchAllData(activeTab);
    }, 180000); // 3분 자동 최신화

    return () => clearInterval(interval);
  }, [activeTab, fetchAllData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim() !== "") {
      fetchAllData(searchQuery);
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white p-3 md:p-8 font-sans selection:bg-blue-500/30 relative overflow-x-hidden">
      {/* 로그인 영역 */}
      <div className="max-w-6xl mx-auto flex justify-end items-center mb-4">
        {!isSignedIn ? (
          <SignInButton mode="modal">
            <button className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-xl font-bold text-sm">
              로그인 / 회원가입
            </button>
          </SignInButton>
        ) : (
          <UserButton />
        )}
      </div>

      <div className="max-w-6xl mx-auto">
        {/* 검색 */}
        <div className="flex justify-between items-center mb-4">
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-[#151518] px-3 py-1.5 rounded-full border border-gray-800"
          >
            <input
              type="text"
              placeholder="검색어 입력..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-gray-300 focus:outline-none w-32 md:w-44 px-2"
            />
            <button type="submit">
              <Search
                size={14}
                className="text-gray-400 hover:text-white transition-colors"
              />
            </button>
          </form>
        </div>

        {/* 헤더 */}
        <header className="flex flex-col items-center py-6 md:py-10">
          <div className="bg-blue-600/10 text-blue-500 text-[10px] font-black px-3 py-1 rounded mb-4 border border-blue-500/20 flex items-center gap-2 tracking-tighter uppercase">
            <Zap size={10} fill="currentColor" />
            Semi-conductor Insight Provider
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic mb-2 text-center uppercase">
            STOCKDATA <span className="text-blue-500">PRO</span>
          </h1>

          <div className="flex items-center gap-2 text-gray-600 text-[10px] font-medium mt-2">
            <RefreshCcw size={10} className={loading ? "animate-spin" : ""} />
            실시간 업데이트 중: {lastUpdated.toLocaleTimeString()}
          </div>
        </header>

        {/* AI 브리핑 */}
        <section className="mb-8 px-1">
          <div className="bg-[#151518] rounded-3xl border border-gray-800 p-6 md:p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] -z-10 group-hover:bg-blue-600/10 transition-colors"></div>

            <div className="flex items-center gap-2 mb-6">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Lightbulb size={18} className="text-white" />
              </div>

              <span className="text-blue-500 font-black text-xs uppercase italic tracking-widest">
                Today&apos;s AI Briefing
              </span>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl md:text-4xl font-black tracking-tighter italic text-white uppercase leading-tight">
                {aiAnalysis.title}
              </h2>

              <p className="text-gray-400 text-sm md:text-lg font-medium leading-relaxed max-w-3xl">
                {aiAnalysis.content}
              </p>
            </div>
          </div>
        </section>

        {/* 카테고리 탭 */}
        <div className="mb-10 max-w-xl mx-auto px-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 justify-center">
            {["반도체", "2차전지", "AI/SW", "로봇", "자동차"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl text-[11px] font-black whitespace-nowrap transition-all uppercase tracking-tighter ${
                  activeTab === tab
                    ? "bg-white text-black scale-105 shadow-xl shadow-white/5"
                    : "bg-[#151518] text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* 뉴스 + 공시 */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-24">
          {/* 뉴스 */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Newspaper className="text-blue-500" />
              <h2 className="text-3xl font-black italic uppercase">
                TECH NEWS
              </h2>
            </div>

            <div className="space-y-6">
              {news.map((item, idx) => (
                <a
                  key={idx}
                  href={item.url || item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-[#151518] border border-gray-800 rounded-3xl p-6 hover:border-blue-500/40 hover:scale-[1.01] transition-all cursor-pointer"
                >
                  <h3
                    className="font-bold text-lg leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: item.title }}
                  />
                  <p className="text-blue-500 text-sm mt-4">
                    기사 전문 보기 ↗
                  </p>
                </a>
              ))}
            </div>
          </div>

          {/* 공시 */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <BellRing className="text-red-500" />
              <h2 className="text-3xl font-black italic uppercase">
                DART FEED
              </h2>
            </div>

            <div className="space-y-6">
              {disclosures.map((item, idx) => (
                <a
                  key={idx}
                  href={`https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${item.rcept_no}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-[#151518] border border-gray-800 rounded-3xl p-6 hover:border-red-500/40 hover:scale-[1.01] transition-all cursor-pointer"
                >
                  <div className="flex justify-between text-xs text-gray-500 mb-4">
                    <span>{item.corp_name}</span>
                    <span>{item.rcept_dt}</span>
                  </div>

                  <h3 className="font-bold text-lg leading-relaxed mb-6">
                    {item.report_nm}
                  </h3>

                  <div className="w-full border border-red-500/40 text-red-500 rounded-2xl py-3 font-bold text-center hover:bg-red-500/10 transition">
                    공시 세부 확인 ↗
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}