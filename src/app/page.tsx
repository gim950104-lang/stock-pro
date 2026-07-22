"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import {
  RefreshCcw,
  Zap,
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
  const { isSignedIn, isLoaded, user } = useUser();
  useEffect(() => {
  const checkPro = async () => {
    if (!isSignedIn || !user) {
  setIsPro(false);
  return;
}
await supabase
  .from("users")
  .upsert(
    {
      clerk_id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      is_pro: false,
      
    },
    {
      onConflict: "clerk_id",
    }
  );
    const { data } = await supabase
      .from("users")
      .select("is_pro")
      .eq("clerk_id", user?.id)
      .maybeSingle()
console.log(data);
    if (data?.is_pro) {
     setIsPro(data?.is_pro === true);
    }
  };

  if (user?.id) {
    checkPro();
  }
}, [isSignedIn, user]);

  const [activeTab, setActiveTab] = useState("반도체");
  const [currentQuery, setCurrentQuery] = useState("반도체");
  const [isSearchMode, setIsSearchMode] = useState(false);

  const [news, setNews] = useState<any[]>([]);
  const [isPro, setIsPro] = useState(false);
  console.log("현재 isPro 상태:", isPro);
  const [disclosures, setDisclosures] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNews, setSelectedNews] = useState<any | null>(null);
  const [aiSummary, setAiSummary] = useState("");
const [aiLoading, setAiLoading] = useState(false);
const [summaryCount, setSummaryCount] = useState(0);
useEffect(() => {
  const loadSummaryCount = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
    
      .from("users")
      .select("summary_count")
      .eq("clerk_id", user.id)
      .single();
console.log("loadSummaryCount data =", data);
console.log("loadSummaryCount error =", error);
    if (data) {
      setSummaryCount(data.summary_count || 0);
    }
  };

  loadSummaryCount();
}, [user?.id]);
const generateAiSummary = async (
  content: string,
  url: string
) => {
  console.log("user.id =", user?.id);
console.log("summaryCount =", summaryCount);
  if (!isSignedIn) {
  window.location.href = "/sign-in";
  return;
}
console.log("현재 summaryCount =", summaryCount);
if (!isPro && summaryCount >= 3) {
  window.location.href = "/pro";
  return;
}

  try {
    setAiLoading(true);
    setAiSummary("");
   

    const response = await fetch("/api/ai-summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  content,
  url,
}),
    });

    if (!response.ok) {
  setAiSummary("AI 요약 서버 오류");
  return;
}

const data = await response.json();


setAiSummary(data.summary || "요약 결과 없음");

const newCount = summaryCount + 1;

setSummaryCount(newCount);

await supabase
  .from("users")
  .update({ summary_count: newCount })
  .eq("clerk_id", user.id);

if (!isPro && newCount >= 3) {
  window.location.href = "/pro";
}
  } catch (error) {
    setAiSummary("AI 요약 생성 실패");
  } finally {
    setAiLoading(false);
  }
};
  const cache = useRef<Record<string, any>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

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

      setCurrentQuery(query);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const queryToFetch = isSearchMode ? currentQuery : activeTab;

    fetchAllData(queryToFetch);

    const interval = setInterval(() => {
      fetchAllData(queryToFetch);
    }, 900000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    setIsSearchMode(true);

    setTimeout(() => {
      fetchAllData(searchQuery.trim());
    }, 500);
  };

  const clearSearch = async () => {
    setSearchQuery("");
    setIsSearchMode(false);
    setCurrentQuery(activeTab);

    await fetchAllData(activeTab);
  };

  const handleTabClick = async (tab: string) => {
    setActiveTab(tab);

    setIsSearchMode(false);
    setSearchQuery("");

    await fetchAllData(tab);
  };
  const tabs = ["반도체", "AI", "2차전지", "자동차"];

  if (!mounted || !isLoaded) return null;

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white p-3 md:p-8 font-sans selection:bg-blue-500/30 relative overflow-x-hidden">
   
      <div className="max-w-6xl mx-auto flex justify-end items-center gap-3 mb-4">

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

  <button
    onClick={() => window.location.href = "/pro"}
    className="bg-[#151518] border border-yellow-500/20 hover:border-yellow-400 text-yellow-400 px-4 py-2 rounded-xl text-sm font-bold transition"
  >
    👑 PRO
  </button>

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
        

        

</div>
<header className="flex flex-col items-center py-6 md:py-10">

  <div className="bg-blue-600/10 text-blue-500 text-[10px] font-black px-3 py-1 rounded mb-4 border border-blue-500/20 flex items-center gap-2 tracking-tighter uppercase">
    <Zap size={10} fill="currentColor" />
    Insight Provider
  </div>

  <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic mb-2 text-center uppercase">
    STOCKDATA <span className="text-blue-500">PRO</span>
  </h1>

  <div className="flex items-center gap-2 text-gray-400 text-[11px] font-medium mt-2">
    <RefreshCcw
      size={12}
      className={loading ? "animate-spin" : ""}
    />

    {loading
      ? `${currentQuery} 데이터 검색 중...`
      : `실시간 업데이트: ${lastUpdated.toLocaleTimeString()}`}
  </div>

</header>
{/* AI 시황 브리핑 */}
<div className="max-w-5xl mx-auto mb-10">
  <div className="bg-[#151518] border border-blue-500/20 rounded-3xl p-6 md:p-8">

    <div className="flex items-center gap-3 mb-4">
      <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />

      <h2 className="text-2xl md:text-3xl font-black italic text-white">
        AI MARKET BRIEFING
      </h2>
    </div>

    <div className="space-y-4 text-sm md:text-base text-gray-300 leading-relaxed">

      <div>
        • 현재{" "}
        <span className="text-blue-400 font-bold">
          {currentQuery}
        </span>{" "}
        시장에서는{" "}

        {news.some((n) =>
          (n.title || "").includes("HBM")
        ) && (
          <span className="text-green-400 font-bold">
            HBM · 고대역폭 메모리
          </span>
        )}

        {news.some((n) =>
          (n.title || "").includes("엔비디아")
        ) && (
          <span className="text-yellow-400 font-bold">
            {" "}· 엔비디아 공급망
          </span>
        )}

        {news.some((n) =>
          (n.title || "").includes("유리기판")
        ) && (
          <span className="text-cyan-400 font-bold">
            {" "}· 유리기판
          </span>
        )}

        {" "}관련 흐름이 강하게 감지되고 있습니다.
      </div>

      <div>
        • 최근 기사 기준{" "}
        <span className="text-red-400 font-bold">
          AI 인프라 · 시설 투자 · 공급 계약
        </span>{" "}
        이슈가 시장 변동성을 확대시키고 있습니다.
      </div>

      <div>
        • 단기 테마주보다{" "}
        <span className="text-green-400 font-bold">
          실적 기반 장비·소재 기업
        </span>{" "}
        중심으로 수급이 순환하는 흐름이 나타나고 있습니다.
      </div>

    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">

      <div className="bg-[#0f0f12] border border-gray-800 rounded-2xl p-4">
        <div className="text-gray-500 text-xs mb-2">핵심 키워드</div>

        <div className="text-blue-400 font-black text-lg">
          {
            news.some((n) =>
              (n.title || "").includes("HBM")
            )
              ? "HBM"
              : "AI 반도체"
          }
        </div>
      </div>

      <div className="bg-[#0f0f12] border border-gray-800 rounded-2xl p-4">
        <div className="text-gray-500 text-xs mb-2">시장 분위기</div>

        <div className="text-yellow-400 font-black text-lg">
          {
            news.length >= 10
              ? "과열"
              : "관심 확대"
          }
        </div>
      </div>

      <div className="bg-[#0f0f12] border border-gray-800 rounded-2xl p-4">
        <div className="text-gray-500 text-xs mb-2">핫 테마</div>

        <div className="text-green-400 font-black text-lg">
          {
            news.some((n) =>
              (n.title || "").includes("유리기판")
            )
              ? "유리기판"
              : "반도체"
          }
        </div>
      </div>

      <div className="bg-[#0f0f12] border border-gray-800 rounded-2xl p-4">
        <div className="text-gray-500 text-xs mb-2">현재 흐름</div>

        <div className="text-red-400 font-black text-lg">
          {
            disclosures.length >= 8
              ? "공시 증가"
              : "관망"
          }
        </div>
      </div>

    </div>

  </div>
  <div>
 <div className="flex justify-center mt-10 mb-14">
  <div className="flex gap-4 bg-[#111114] border border-blue-500/20 rounded-2xl px-5 py-4 shadow-[0_0_30px_rgba(59,130,246,0.08)]">
    {tabs.map((tab) => (
      <button
        key={tab}
        onClick={() => handleTabClick(tab)}
        className={`px-6 py-3 rounded-xl transition-all duration-300 font-semibold ${
          currentQuery === tab
            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
            : "bg-[#0a0a0c] text-gray-300 hover:bg-[#16161a]"
        }`}
      >
        {tab}
      </button>
    ))}
  </div>
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
                    onClick={() => setSelectedNews(item)}
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

                  <button
  onClick={() => {
    

    generateAiSummary(
  selectedNews.content || selectedNews.description,
  selectedNews.url
);
  }}
  className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold mb-3"
>
🧠 AI 요약 보기 (남은 {Math.max(0, 3 - summaryCount)}회)
</button>
<p className="text-xs text-gray-500 mt-2 text-center">
  🚧 PRO 기능은 현재 개발 중입니다.
</p>
<button
  onClick={() => {
  if (!isSignedIn) {
    window.location.href = "/sign-in";
    return;
  }

  window.open(selectedNews?.url, "_blank");
}}
  className="w-full mt-4 border border-gray-700 py-3 rounded-xl"
>
  기사 원문 보기
</button>

                  <button
                    onClick={() => {
  setSelectedNews(null);
  setAiSummary("");
}}
                    className="w-full mt-3 text-gray-500"
                  >
                    닫기
                  </button>
                  {aiLoading && (
  <div className="mt-4 text-center text-blue-400">
    AI가 뉴스 분석 중입니다...
  </div>
)}

{aiSummary && (
  <div className="mt-4 max-h-[400px] overflow-y-auto rounded-xl border border-blue-500/30 bg-[#111827] p-5 text-sm leading-7 text-gray-200 whitespace-pre-wrap">
    {aiSummary}
  </div>
)}
                </div>
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
    </main>
  );
}