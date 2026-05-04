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
  X,
} from "lucide-react";

// --- [기술 키워드] ---
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
  const { isSignedIn, isLoaded } = useUser();

  // 대표 카테고리 (UI 유지)
  const [activeTab, setActiveTab] = useState("반도체");

  // 실제 현재 검색 기준
  const [currentQuery, setCurrentQuery] = useState("반도체");

  // 검색 모드 여부
  const [isSearchMode, setIsSearchMode] = useState(false);

  const [news, setNews] = useState<any[]>([]);
  const [disclosures, setDisclosures] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const aiAnalysis = useMemo(() => {
    const allTitles = [
      ...news.map((n: any) => n.title || ""),
      ...disclosures.map((d: any) => d.report_nm || ""),
    ].join(" ");

    const hotKeyword =
      currentQuery ||
      SEMI_KEYWORDS.find((kw) => allTitles.includes(kw)) ||
      "핵심 산업";

    const criticalCount = disclosures.filter((d: any) =>
      isCriticalDisclosure(d.report_nm || "")
    ).length;

    return {
      title: `${hotKeyword} 중심의 시장 흐름 포착`,
      content:
        criticalCount > 0
          ? `현재 ${hotKeyword} 분야에서 ${criticalCount}건의 주요 공시가 포착되었습니다. 공급계약·시설투자 여부를 체크하세요.`
          : `현재 ${hotKeyword} 관련 핵심 뉴스와 공시를 분석 중입니다. 주요 시장 흐름을 확인하세요.`,
    };
  }, [news, disclosures, currentQuery]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 핵심 데이터 fetch
  const fetchAllData = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);

    try {
      const [newsRes, dartRes] = await Promise.all([
        fetch(`/api/news?query=${encodeURIComponent(query)}`),
        fetch(`/api/dart?query=${encodeURIComponent(query)}`),
      ]);

      const newsData = await newsRes.json();
      const dartData = await dartRes.json();

      const q = query.toLowerCase().trim();

      const filteredNews =
        newsData.articles
          ?.filter((item: any) => {
            const title = (item.title || "").toLowerCase();
            const desc = (item.description || "").toLowerCase();

            return title.includes(q) || desc.includes(q);
          })
          ?.sort((a: any, b: any) => {
            const aTitle = (a.title || "").toLowerCase();
            const bTitle = (b.title || "").toLowerCase();

            const aExact = aTitle.includes(q) ? 1 : 0;
            const bExact = bTitle.includes(q) ? 1 : 0;

            return bExact - aExact;
          })
          ?.slice(0, 12) || [];

      setNews(filteredNews);
      setDisclosures(dartData.list?.slice(0, 12) || []);

      // 실제 검색 기준 업데이트
      setCurrentQuery(query);

      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }, []);

  // 기본 로딩 + 자동 새로고침
  useEffect(() => {
    // 검색 중이면 currentQuery 유지
    // 아니면 activeTab 기준
    const queryToFetch = isSearchMode ? currentQuery : activeTab;

    fetchAllData(queryToFetch);

    const interval = setInterval(() => {
      fetchAllData(queryToFetch);
    }, 180000);

    return () => clearInterval(interval);
  }, [activeTab, currentQuery, isSearchMode, fetchAllData]);

  // 검색
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    setIsSearchMode(true);

    await fetchAllData(searchQuery.trim());
  };

  // 검색 해제 → 대표 카테고리 복귀
  const clearSearch = async () => {
    setSearchQuery("");
    setIsSearchMode(false);
    setCurrentQuery(activeTab);

    await fetchAllData(activeTab);
  };

  // 카테고리 클릭
  const handleTabClick = async (tab: string) => {
    setActiveTab(tab);

    // 카테고리 클릭 시 검색 종료
    setIsSearchMode(false);

    setSearchQuery("");

    await fetchAllData(tab);
  };

  if (!mounted || !isLoaded) return null;

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white p-3 md:p-8 font-sans selection:bg-blue-500/30 relative overflow-x-hidden">
      {/* 로그인 */}
      <div className="max-w-6xl mx-auto flex justify-end items-center mb-4">
        {!isSignedIn ? (
          <SignInButton mode="modal">
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-xl font-bold text-sm"
            >
              로그인 / 회원가입
            </button>
          </SignInButton>
        ) : (
          <UserButton />
        )}
      </div>

      <div className="max-w-6xl mx-auto">
        {/* 검색 */}
        <div className="flex flex-col items-start gap-4 mb-6">
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-[#151518] px-3 py-1.5 rounded-full border border-gray-800"
          >
            <input
              type="text"
              placeholder="회사명 또는 키워드 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-gray-300 focus:outline-none w-48 md:w-72 px-2"
            />

            {isSearchMode && (
              <button
                type="button"
                onClick={clearSearch}
                className="mr-2 text-gray-500 hover:text-white"
              >
                <X size={16} />
              </button>
            )}

            <button type="submit">
              <Search
                size={18}
                className={
                  loading
                    ? "animate-spin text-blue-500"
                    : "text-gray-400 hover:text-white transition-colors"
                }
              />
            </button>
          </form>

          <div className="px-4 py-2 rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-bold">
            현재 검색: {currentQuery}
            {isSearchMode && (
              <span className="ml-2 text-xs text-gray-400">(검색 모드)</span>
            )}
          </div>
        </div>

        {/* 헤더 */}
        <header className="flex flex-col items-center py-6 md:py-10">
          <div className="bg-blue-600/10 text-blue-500 text-[10px] font-black px-3 py-1 rounded mb-4 border border-blue-500/20 flex items-center gap-2 tracking-tighter uppercase">
            <Zap size={10} fill="currentColor" />
            Insight Provider
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic mb-2 text-center uppercase">
            STOCKDATA <span className="text-blue-500">PRO</span>
          </h1>

          <div className="flex items-center gap-2 text-gray-400 text-[11px] font-medium mt-2">
            <RefreshCcw size={12} className={loading ? "animate-spin" : ""} />
            {loading
              ? `${currentQuery} 데이터 검색 중...`
              : `실시간 업데이트: ${lastUpdated.toLocaleTimeString()}`}
          </div>
        </header>

        {/* AI 브리핑 */}
        <section className="mb-8 px-1">
          <div className="bg-[#151518] rounded-3xl border border-gray-800 p-6 md:p-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Lightbulb size={18} className="text-white" />
              </div>

              <span className="text-blue-500 font-black text-xs uppercase italic tracking-widest">
                Today&apos;s AI Briefing
              </span>
            </div>

            <h2 className="text-2xl md:text-4xl font-black tracking-tighter italic uppercase mb-4">
              {aiAnalysis.title}
            </h2>

            <p className="text-gray-400 text-sm md:text-lg leading-relaxed">
              {aiAnalysis.content}
            </p>
          </div>
        </section>

        {/* 카테고리 */}
        <div className="mb-10 max-w-xl mx-auto px-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 justify-center">
            {["반도체", "2차전지", "AI/SW", "로봇", "자동차"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`px-6 py-3 rounded-xl text-[11px] font-black whitespace-nowrap transition-all uppercase tracking-tighter ${
                  activeTab === tab && !isSearchMode
                    ? "bg-white text-black scale-105"
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
                {currentQuery} NEWS
              </h2>
            </div>

            <div className="space-y-6">
              {news.length > 0 ? (
                news.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.url || item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-[#151518] border border-gray-800 rounded-3xl p-6 hover:border-blue-500/40 hover:scale-[1.01] transition-all"
                  >
                    <h3
                      className="font-bold text-lg leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: item.title }}
                    />

                    <p className="text-blue-500 text-sm mt-4">
                      기사 전문 보기 ↗
                    </p>
                  </a>
                ))
              ) : (
                <div className="text-gray-500">관련 뉴스 없음</div>
              )}
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
                  className="block bg-[#151518] border border-gray-800 rounded-3xl p-6 hover:border-red-500/40 hover:scale-[1.01] transition-all"
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