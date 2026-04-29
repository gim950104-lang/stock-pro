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

  // [개선] 사용자가 직접 관리하는 즐겨찾기 상태
  const [myFavorites, setMyFavorites] = useState<string[]>([]);

  const categories = ["반도체", "2차전지", "AI/SW", "로봇", "자동차"];

  // 페이지 로드 시 저장된 즐겨찾기 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("stock-pro-favorites");
    if (saved) {
      setMyFavorites(JSON.parse(saved));
    }
  }, []);

  // 즐겨찾기 토글 함수 (추가/삭제)
  const toggleFavorite = (corp: string) => {
    if (!corp) return;
    let updated;
    if (myFavorites.includes(corp)) {
      updated = myFavorites.filter((f) => f !== corp);
    } else {
      updated = [corp, ...myFavorites].slice(0, 8); // 최대 8개까지 저장
    }
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
    } catch (err) {
      console.error("데이터 로드 에러:", err);
    }
    setLoading(false);
  }, []);

  // 자동 새로고침 (5분 주기)
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
      setActiveTab(searchQuery.trim());
      fetchAllData(searchQuery.trim());
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
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

        {/* 검색창 및 즐겨찾기 추가 버튼 영역 */}
        <div className="mb-12 max-w-xl mx-auto w-full px-2">
          <form onSubmit={handleSearch} className="relative group mb-4">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="기업명 혹은 테마 입력"
              className="w-full bg-[#151518] border border-gray-800 rounded-2xl pl-14 pr-6 py-4 md:py-5 text-sm focus:outline-none focus:border-blue-500/50 transition-all text-white shadow-2xl shadow-black"
            />
          </form>
          
          {/* 현재 검색 결과 즐겨찾기 버튼 (검색어가 있을 때만 표시) */}
          {activeTab && !categories.includes(activeTab) && (
            <div className="flex justify-center">
              <button 
                onClick={() => toggleFavorite(activeTab)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[11px] font-bold transition-all ${
                  myFavorites.includes(activeTab) 
                  ? "border-yellow-500/50 text-yellow-500 bg-yellow-500/5" 
                  : "border-gray-800 text-gray-500 hover:border-gray-600"
                }`}
              >
                <Star size={12} fill={myFavorites.includes(activeTab) ? "currentColor" : "none"} />
                {myFavorites.includes(activeTab) ? "즐겨찾기 해제" : `'${activeTab}' 즐겨찾기 등록`}
              </button>
            </div>
          )}
        </div>

        {/* 네비게이션 섹션 */}
        <nav className="flex flex-col gap-6 mb-14">
          {/* 기본 카테고리 */}
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

          {/* [개선] 동적 즐겨찾기 리스트 (데이터가 있을 때만 표시) */}
          {myFavorites.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center px-2 border-t border-gray-900 pt-6">
              {myFavorites.map((corp) => (
                <button
                  key={corp}
                  onClick={() => { setActiveTab(corp); fetchAllData(corp); }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold transition-all border whitespace-nowrap ${
                    activeTab === corp ? "border-blue-500 bg-blue-500/10 text-blue-500" : "border-gray-800 bg-[#151518]/50 text-gray-600 hover:border-gray-600"
                  }`}
                >
                  <Star size={10} fill="currentColor" className="text-yellow-600" />
                  {corp}
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* 메인 컨텐츠 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          
          {/* 뉴스 섹션 */}
          <section className="px-2">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
              <Newspaper className="text-blue-500" size={20} />
              <h2 className="text-xl font-bold tracking-tight text-gray-200">Market News</h2>
            </div>
            <div className="space-y-4">
              {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div> : 
                news.length > 0 ? news.map((item: any, idx) => (
                <div key={idx} className="group bg-[#151518] p-5 md:p-6 rounded-2xl border border-gray-900 hover:border-gray-700 transition-all">
                  <h3 className="font-bold text-sm md:text-base mb-4 leading-snug text-gray-100 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                  <a href={item.url} target="_blank" className="text-[10px] text-blue-500 font-black uppercase flex items-center gap-1 hover:underline">
                    Read Story <ExternalLink size={10} />
                  </a>
                </div>
              )) : <p className="text-center py-20 text-gray-700 italic">뉴스가 없습니다.</p>}
            </div>
          </section>

          {/* 공시 섹션 */}
          <section className="px-2">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
              <Bell className="text-red-500" size={20} />
              <h2 className="text-xl font-bold tracking-tight text-gray-200">DART Disclosure</h2>
            </div>
            <div className="space-y-4">
              {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-500" /></div> : 
                disclosures.length > 0 ? disclosures.map((item: any, idx) => (
                <div key={idx} className="bg-[#151518] p-5 md:p-6 rounded-2xl border border-gray-900 border-l-4 border-l-red-600/50 hover:border-red-900/30 transition-all">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[11px] font-black text-red-500 uppercase">{item.corp_name}</span>
                    <span className="text-[10px] text-gray-600 font-mono italic">{item.rcept_dt}</span>
                  </div>
                  <h3 className="font-bold text-[13px] md:text-sm mb-5 text-gray-300 line-clamp-2 leading-relaxed">{item.report_nm}</h3>
                  <a href={`https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${item.rcept_no}`} target="_blank" className="block text-center py-3 bg-red-600/10 text-red-500 text-[10px] font-black rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-600/20">VIEW DOCUMENT</a>
                </div>
              )) : <p className="text-center py-20 text-gray-700 font-mono text-xs italic uppercase tracking-widest">No Data Available</p>}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}