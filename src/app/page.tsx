"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, Newspaper, Bell, ExternalLink, Loader2, Star, RefreshCcw, Zap } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("반도체");
  const [searchQuery, setSearchQuery] = useState("");
  const [news, setNews] = useState([]);
  const [disclosures, setDisclosures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // [1단계] 즐겨찾기 및 카테고리 구성
  const categories = ["반도체", "2차전지", "AI/SW", "로봇", "자동차"];
  const favorites = ["삼성전자", "SK하이닉스", "한미반도체", "ASML"];

  const fetchAllData = useCallback(async (query: string) => {
    if (!query) return;
    setLoading(true);
    try {
      // 뉴스 호출 (서버 API 경유)
      const newsRes = await fetch(`/api/news?query=${encodeURIComponent(query)}`);
      const newsData = await newsRes.json();
      setNews(newsData.articles?.slice(0, 6) || []);

      // 공시 호출 (서버 API 경유)
      const dartRes = await fetch(`/api/dart?query=${encodeURIComponent(query)}`);
      const dartData = await dartRes.json();
      setDisclosures(dartData.list || []);
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error("데이터 로드 에러:", err);
    }
    setLoading(false);
  }, []);

  // [2단계] 자동 새로고침 (5분 주기)
  useEffect(() => {
    fetchAllData(activeTab);
    const timer = setInterval(() => {
      fetchAllData(activeTab);
    }, 300000); 
    return () => clearInterval(timer);
  }, [activeTab, fetchAllData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveTab("");
      fetchAllData(searchQuery);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* 헤더: 모바일에서 가독성 있게 텍스트 크기 조절 */}
        <header className="flex flex-col items-center py-10 md:py-14">
          <div className="bg-blue-600/10 text-blue-500 text-[10px] font-black px-3 py-1 rounded mb-4 tracking-widest uppercase border border-blue-500/20">
            Real-Time Feed
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic mb-3 text-center">
            STOCKDATA <span className="text-blue-500">PRO</span>
          </h1>
          <div className="flex items-center gap-2 text-gray-600 text-[11px] font-medium">
            <RefreshCcw size={12} className={loading ? "animate-spin" : ""} />
            Last Updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </header>

        {/* 검색창: 모바일 터치 편의성 향상 */}
        <form onSubmit={handleSearch} className="mb-10 max-w-xl mx-auto w-full px-2">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="기업명 혹은 테마 입력"
              className="w-full bg-[#151518] border border-gray-800 rounded-2xl pl-14 pr-6 py-4 md:py-5 text-sm focus:outline-none focus:border-blue-500/50 transition-all text-white shadow-2xl shadow-black"
            />
          </div>
        </form>

        {/* [1단계] 네비게이션 & [3단계] 모바일 반응형 스크롤 */}
        <nav className="flex flex-col gap-4 mb-14">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:justify-center px-2">
            {categories.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); fetchAllData(tab); }}
                className={`px-6 py-2.5 rounded-full text-[11px] font-bold transition-all whitespace-nowrap ${
                  activeTab === tab ? "bg-white text-black scale-105" : "bg-[#151518] text-gray-500 hover:bg-[#1c1c21]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:justify-center px-2">
            {favorites.map((corp) => (
              <button
                key={corp}
                onClick={() => { setActiveTab(corp); fetchAllData(corp); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold transition-all border whitespace-nowrap ${
                  activeTab === corp ? "border-blue-500 bg-blue-500/10 text-blue-500" : "border-gray-800 bg-transparent text-gray-600"
                }`}
              >
                <Star size={10} fill={activeTab === corp ? "currentColor" : "none"} />
                {corp}
              </button>
            ))}
          </div>
        </nav>

        {/* [3단계] 메인 컨텐츠: 모바일은 1열, PC는 2열 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          
          {/* 뉴스 섹션 */}
          <section className="px-2">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
              <Newspaper className="text-blue-500" size={20} />
              <h2 className="text-xl font-bold tracking-tight">Market News</h2>
            </div>
            <div className="space-y-4">
              {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div> : 
                news.length > 0 ? news.map((item: any, idx) => (
                <div key={idx} className="bg-[#151518] p-5 md:p-6 rounded-2xl border border-gray-900 hover:border-gray-700 transition-all">
                  <h3 className="font-bold text-sm md:text-base mb-4 leading-snug text-gray-100">{item.title}</h3>
                  <a href={item.url} target="_blank" className="text-[10px] text-blue-500 font-black uppercase flex items-center gap-1 hover:underline">
                    Read Story <ExternalLink size={10} />
                  </a>
                </div>
              )) : <p className="text-center py-20 text-gray-700">뉴스가 없습니다.</p>}
            </div>
          </section>

          {/* 공시 섹션 */}
          <section className="px-2">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
              <Bell className="text-red-500" size={20} />
              <h2 className="text-xl font-bold tracking-tight">DART Disclosure</h2>
            </div>
            <div className="space-y-4">
              {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-500" /></div> : 
                disclosures.length > 0 ? disclosures.map((item: any, idx) => (
                <div key={idx} className="bg-[#151518] p-5 md:p-6 rounded-2xl border border-gray-900 border-l-4 border-l-red-600/50 hover:border-red-900/30 transition-all">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[11px] font-black text-red-500 uppercase">{item.corp_name}</span>
                    <span className="text-[10px] text-gray-600 font-mono italic">{item.rcept_dt}</span>
                  </div>
                  <h3 className="font-bold text-[13px] md:text-sm mb-5 text-gray-300 line-clamp-2">{item.report_nm}</h3>
                  <a href={`https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${item.rcept_no}`} target="_blank" className="block text-center py-3 bg-red-600/10 text-red-500 text-[10px] font-black rounded-xl hover:bg-red-600 hover:text-white transition-all">VIEW DOCUMENT</a>
                </div>
              )) : <p className="text-center py-20 text-gray-700 font-mono text-xs italic uppercase">No Data Available</p>}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}