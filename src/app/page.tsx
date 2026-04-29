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

  // [AI] 자동 생성 브리핑 상태
  const [aiBriefing, setAiBriefing] = useState({
    title: "데이터 분석 중...",
    content: "최신 반도체 소식을 실시간으로 읽어오고 있습니다."
  });

  const categories = ["반도체", "2차전지", "AI/SW", "로봇", "자동차"];

  // [AI] 실시간 데이터 기반 브리핑 생성 함수
  const generateAiBriefing = useCallback((newsList: any[]) => {
    if (newsList.length === 0) return;
    
    const topHeadline = newsList[0].title;
    // 제목 키워드 추출 로직
    const isHBM = topHeadline.includes("HBM") || topHeadline.includes("메모리");
    const isFoundry = topHeadline.includes("파운드리") || topHeadline.includes("TSMC") || topHeadline.includes("삼성");

    if (isHBM) {
      setAiBriefing({
        title: "AI 메모리 시장의 '초격차'가 시작되었습니다",
        content: `현재 '${topHeadline.slice(0, 25)}...' 뉴스가 가장 화제입니다. 엔지니어 관점에서 고대역폭 메모리 공정의 유지보수 난이도가 높아질 것으로 보이니 관련 장비 공시를 주시하세요.`
      });
    } else if (isFoundry) {
      setAiBriefing({
        title: "파운드리 수주 경쟁, 장비 입고 속도가 관건입니다",
        content: `주요 기업들의 위탁생산 경쟁이 치열해지며 신규 라인 증설 속도가 빨라지고 있습니다. 장비 유지보수 인력 수요가 급증할 것으로 예측됩니다.`
      } );
    } else {
      setAiBriefing({
        title: "오늘의 반도체 기술 트렌드 분석",
        content: `현재 시장은 '${topHeadline.slice(0, 20)}' 이슈를 주목하고 있습니다. 전반적인 공정 흐름을 파악하여 장비 가동률 변화를 체크하시기 바랍니다.`
      });
    }
  }, []);

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
      const articles = newsData.articles?.slice(0, 6) || [];
      setNews(articles);
      
      // 데이터 로드 성공 시 AI 브리핑 업데이트
      generateAiBriefing(articles);

      const dartRes = await fetch(`/api/dart?query=${encodeURIComponent(query)}`);
      const dartData = await dartRes.json();
      setDisclosures(dartData.list || []);
      setLastUpdated(new Date());
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [generateAiBriefing]);

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
            실시간 동기화 완료: {lastUpdated.toLocaleTimeString()}
          </div>
        </header>

        {/* 1. [수정] 누구나 이해하는 한글 섹터맵 */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-5 text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">
            <TrendingUp size={14} className="text-blue-500" /> 반도체 시장 온도 (Sector Heatmap)
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-blue-600 rounded-2xl p-5 flex flex-col justify-end border border-white/10 hover:bg-blue-500 transition-all cursor-pointer shadow-lg shadow-blue-900/20">
              <span className="text-[10px] font-bold opacity-80 uppercase">초고대역폭 메모리</span>
              <span className="font-black text-xl italic leading-none mt-1">HBM (메모리)</span>
              <span className="mt-3 text-[9px] font-bold bg-blue-400/30 px-2 py-0.5 rounded w-fit">매우 뜨거움</span>
            </div>
            <div className="bg-[#151518] rounded-2xl p-5 flex flex-col justify-end border border-gray-800 hover:border-gray-600 transition-all cursor-pointer">
              <span className="text-[10px] font-bold text-gray-500 uppercase">생산 대행</span>
              <span className="font-black text-lg leading-none mt-1 text-gray-200">파운드리</span>
              <span className="mt-3 text-[9px] font-bold bg-gray-800 px-2 py-0.5 rounded w-fit text-gray-400">보통</span>
            </div>
            <div className="bg-green-900/30 rounded-2xl p-5 flex flex-col justify-end border border-green-500/20">
              <span className="text-[10px] font-black text-green-500 uppercase">조립 및 테스트</span>
              <span className="font-black text-lg leading-none mt-1 text-green-100 italic">후공정 (OSAT)</span>
              <span className="mt-3 text-[9px] font-bold bg-green-500/20 px-2 py-0.5 rounded w-fit text-green-400">주목</span>
            </div>
            <div className="bg-red-900/10 rounded-2xl p-5 flex flex-col justify-end border border-red-500/20 opacity-60">
              <span className="text-[10px] font-black text-red-500 uppercase">구형 장비</span>
              <span className="font-black text-lg leading-none mt-1 text-red-200">레거시 공정</span>
              <span className="mt-3 text-[9px] font-bold bg-red-500/10 px-2 py-0.5 rounded w-fit text-red-400">차가움</span>
            </div>
          </div>
        </section>

        {/* 2. [수정] AI 실시간 자동 브리핑 */}
        {showBriefing && (
          <section className="mb-12 bg-gradient-to-br from-blue-950/40 to-[#0c0c0e] border border-blue-500/30 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute -top-10 -right-10 opacity-5 rotate-12"><Newspaper size={200} /></div>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3 bg-blue-600 px-4 py-1.5 rounded-full text-[11px] font-black uppercase shadow-lg shadow-blue-600/30">
                <Zap size={14} fill="white" /> AI 실시간 분석 Report
              </div>
              <button onClick={() => setShowBriefing(false)} className="text-gray-600 hover:text-white transition-colors"><X size={20}/></button>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-black leading-tight italic tracking-tighter">
                "{aiBriefing.title}"
              </h3>
              <p className="text-gray-400 text-base md:text-lg font-medium leading-relaxed max-w-3xl">
                {aiBriefing.content}
              </p>
              <div className="pt-4 flex items-center gap-2 text-[11px] text-blue-500 font-black italic">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                현재 수집된 데이터를 바탕으로 자동 업데이트 되었습니다.
              </div>
            </div>
          </section>
        )}

        {/* 검색창 */}
        <div className="mb-12 max-w-xl mx-auto px-2">
          <form onSubmit={(e) => { e.preventDefault(); if(searchQuery.trim()) { setActiveTab(searchQuery.trim()); fetchAllData(searchQuery.trim()); } }} className="relative group mb-6">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="기업명 혹은 '노광장비' 같은 기술 검색" className="w-full bg-[#151518] border-2 border-gray-900 rounded-[1.5rem] pl-16 pr-8 py-5 text-sm focus:outline-none focus:border-blue-500/50 transition-all shadow-2xl shadow-black" />
          </form>
          {activeTab && !categories.includes(activeTab) && (
            <div className="flex justify-center">
              <button onClick={() => toggleFavorite(activeTab)} className={`flex items-center gap-2 px-6 py-2 rounded-full border-2 text-[11px] font-black tracking-tighter transition-all ${myFavorites.includes(activeTab) ? "border-yellow-500/50 text-yellow-500 bg-yellow-500/5 shadow-lg shadow-yellow-500/5" : "border-gray-800 text-gray-500"}`}>
                <Star size={14} fill={myFavorites.includes(activeTab) ? "currentColor" : "none"} /> {myFavorites.includes(activeTab) ? "즐겨찾기 삭제" : `'${activeTab.toUpperCase()}' 즐겨찾기 등록`}
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
                  <a href={item.url} target="_blank" className="inline-flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline underline-offset-4">기사 전문 보기 <ExternalLink size={12} /></a>
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
                        {critical ? '⚡ 중요 공시 분석 완료' : '공시 서류 확인'}
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