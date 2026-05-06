"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  const cache = useRef<Record<string, any>>({});
const [isProOpen, setIsProOpen] = useState(false);
const [isProUser, setIsProUser] = useState(false);
const [selectedNews, setSelectedNews] = useState<any | null>(null);
  const aiAnalysis = useMemo(() => {
  if (!selectedNews) return null;

  const title = selectedNews.title || "";

  let impact = "중립";
  let keywords: string[] = [];

  if (
    title.includes("상승") ||
    title.includes("급등") ||
    title.includes("수혜")
  ) {
    impact = "긍정";
  }

  if (
    title.includes("하락") ||
    title.includes("급락") ||
    title.includes("악재")
  ) {
    impact = "부정";
  }

  if (title.includes("반도체")) keywords.push("반도체");
  if (title.includes("AI")) keywords.push("AI");
  if (title.includes("삼성")) keywords.push("삼성");
  if (title.includes("테슬라")) keywords.push("테슬라");

  return {
    summary: title.replace(/<[^>]*>?/gm, ""),
    impact,
    keywords,
  };
}, [selectedNews]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 핵심 데이터 fetch
  const fetchAllData = useCallback(async (query: string) => {
    if (!query.trim()) return;
    if (cache.current[query]) {
  const cached = cache.current[query];
  setNews(cached.news);
  setDisclosures(cached.disclosures);
  setCurrentQuery(query);
  return;
}
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
cache.current[query] = {
  news: filteredNews,
  disclosures: dartData.list?.slice(0, 12) || [],
};
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
    }, 900000);

    return () => clearInterval(interval);
}, []);

  // 검색
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    setIsSearchMode(true);

    setTimeout(() => {
  fetchAllData(searchQuery.trim());
}, 500);
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
              {aiAnalysis?.summary}
            </h2>

            <p className="text-gray-400 text-sm md:text-lg leading-relaxed">
              {aiAnalysis?.impact}
            </p>
          </div>
        </section>
        {/* PRO MINI BANNER */}
        <section className="mb-6 max-w-6xl mx-auto px-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 via-[#151518] to-[#151518] px-4 py-4 md:px-6 shadow-lg">
            
            {/* 왼쪽 */}
            <div className="flex items-start md:items-center gap-3">
              {/* 왕관 */}
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/30 text-xl">
                👑
              </div>

              {/* 텍스트 */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-yellow-400 text-xs font-black uppercase tracking-widest">
                    STOCKDATA PRO
                  </span>

                  <span className="text-gray-500 text-xs">
                    초고속 요약 · 주가 영향도 · 수혜주 추천 · VIP 공시
                  </span>
                </div>

                <p className="text-sm md:text-base text-white font-bold mt-1">
                  뉴스보다 빠른 투자 판단
                </p>
              </div>
            </div>

            {/* 오른쪽 버튼 */}
            <button 
            onClick={() => setIsProOpen(true)}
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-black text-sm px-5 py-2.5 rounded-xl transition-all whitespace-nowrap">
              PRO 보기
            </button>
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
                  <div
                    key={idx}
                   onClick={(e) => {
  setSelectedNews(item);
}}
                    className="block bg-[#151518] border border-gray-800 rounded-3xl p-6 hover:border-blue-500/40 hover:scale-[1.01] transition-all"
                  >
                    <h3
                      className="font-bold text-lg leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: item.title }}
                    />

                    <p className="text-blue-500 text-sm mt-4">
                      기사 전문 보기 ↗
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">관련 뉴스 없음</div>
              )}
            </div>
            {selectedNews && (
  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
    <div className="bg-[#111114] border border-yellow-500/20 rounded-3xl p-8 w-[90%] max-w-md">

      <h2 className="text-2xl font-bold mb-4">
        🧠 AI 요약 보기
      </h2>

      <p className="text-gray-400 mb-6">
        선택한 기사를 AI가 핵심만 빠르게 요약해줍니다.
      </p>

      {!isProUser ? (
        <div>
          <p className="text-yellow-400 mb-4">
            PRO 전용 기능입니다
          </p>

          <button
            onClick={() => setIsProOpen(true)}
            className="w-full bg-yellow-400 text-black py-3 rounded-xl font-bold"
          >
            PRO 시작하기
          </button>
        </div>
      ) : (
      <div className="mt-6 rounded-2xl border border-blue-500/30 bg-[#111827] p-5">
  <h3 className="text-blue-400 font-bold text-lg mb-4">
    🤖 AI 요약 분석
  </h3>

  <div className="space-y-3 text-sm">
    <div>
      <span className="text-gray-400">📌 핵심:</span>
      <p className="text-white mt-1">
        {aiAnalysis?.summary}
      </p>
    </div>

    <div>
      <span className="text-gray-400">📈 영향도:</span>
      <p
        className={`mt-1 font-bold ${
          aiAnalysis?.impact === "긍정"
            ? "text-green-400"
            : aiAnalysis?.impact === "부정"
            ? "text-red-400"
            : "text-yellow-400"
        }`}
      >
        {aiAnalysis?.impact}
      </p>
    </div>

    <div>
      <span className="text-gray-400">🎯 키워드:</span>
      <div className="flex gap-2 flex-wrap mt-2">
        {aiAnalysis?.keywords.map((kw: string) => (
          <span
            key={kw}
            className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs"
          >
            #{kw}
          </span>
        ))}
      </div>
    </div>
  </div>
</div>
      )}

      <button
        onClick={() => window.open(selectedNews.url || selectedNews.link)}
        className="w-full mt-4 border border-gray-700 py-3 rounded-xl"
      >
        기사 원문 보기
      </button>

      <button
        onClick={() => setSelectedNews(null)}
        className="w-full mt-3 text-gray-500"
      >
        닫기
      </button>

    </div>
  </div>
)}
            {selectedNews && isProUser && (
  <div>
    <p>AI 요약: {selectedNews.title}</p>
  </div>
)}

{selectedNews && !isProUser && (
  <div>
    <p>PRO 전용 기능입니다</p>
    <button onClick={() => setIsProOpen(true)}>
      PRO 시작하기
    </button>
  </div>
)}
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
     {isProOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div className="bg-[#111114] border border-yellow-500/30 rounded-3xl w-[95%] max-w-md p-6">

      <button
        onClick={() => setIsProOpen(false)}
        className="text-white text-xl mb-4"
      >
        ✕
      </button>

      <h2 className="text-white text-2xl font-bold mb-2">
        🚀 STOCKDATA PRO
      </h2>

      <p className="text-gray-400 text-sm mb-6">
        뉴스보다 빠른 투자 판단을 경험하세요
      </p>

      <div className="bg-yellow-400 text-black text-center py-3 rounded-xl font-bold text-lg mb-6">
        ₩4,900 / 월
      </div>

      <div className="space-y-3 text-sm text-gray-300 mb-6">
        <div>⚡ AI 초고속 요약</div>
        <div>📊 수혜주 자동 추천</div>
        <div>🚨 VIP 공시 알림</div>
        <div>🚀 광고 제거 + 속도 향상</div>
      </div>

      459 <button onClick={() => window.location.href = "/pro"} className="w-full bg-yellow-400 hover:bg-yellow-300 text-black py-3 rounded-xl font-bold">
        PRO 시작하기
      </button>

    </div>
  </div>
)}
    </main>
  );
}