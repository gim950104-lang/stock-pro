"use client";
import { useState, useEffect } from "react";
import { Search, Newspaper, Bell, ExternalLink, Loader2 } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("반도체");
  const [searchQuery, setSearchQuery] = useState("");
  const [news, setNews] = useState([]);
  const [disclosures, setDisclosures] = useState([]);
  const [loading, setLoading] = useState(false);

  const categories = ["반도체", "2차전지", "AI/SW", "로봇", "자동차"];

  const fetchAllData = async (query: string) => {
    if (!query) return;
    setLoading(true);
    try {
      // [수정 포인트] 외부 API가 아닌 우리가 만든 내부 API(/api/news)를 호출합니다.
      // 이렇게 하면 Vercel 서버가 대신 뉴스를 가져오기 때문에 도메인 차단을 피할 수 있습니다.
      const newsRes = await fetch(`/api/news?query=${encodeURIComponent(query)}`);
      const newsData = await newsRes.json();
      setNews(newsData.articles?.slice(0, 6) || []);

      const dartRes = await fetch(`/api/dart?query=${encodeURIComponent(query)}`);
      const dartData = await dartRes.json();
      setDisclosures(dartData.list || []);
    } catch (err) {
      console.error("데이터 로드 에러:", err);
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveTab("");
      fetchAllData(searchQuery);
    }
  };

  useEffect(() => {
    fetchAllData(activeTab);
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col items-center py-12">
          <div className="bg-blue-600 text-[10px] font-black px-2 py-0.5 rounded mb-3 tracking-widest uppercase">Real-Time Terminal</div>
          <h1 className="text-5xl font-black tracking-tighter italic mb-2 text-center">
            STOCKDATA <span className="text-blue-500">PRO</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium">실시간 마켓 뉴스 및 DART 기업 공시 통합 시스템</p>
        </header>

        <form onSubmit={handleSearch} className="mb-12 max-w-xl mx-auto w-full">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="기업명 혹은 시장 테마를 입력하세요"
              className="w-full bg-[#151518] border border-gray-800 rounded-2xl pl-14 pr-6 py-4.5 text-sm focus:outline-none focus:border-blue-500/50 transition-all text-white"
            />
          </div>
        </form>

        <nav className="flex gap-3 mb-12 overflow-x-auto no-scrollbar justify-center">
          {categories.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); fetchAllData(tab); }}
              className={`px-8 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab ? "bg-white text-black scale-105 shadow-lg shadow-white/5" : "bg-[#151518] text-gray-500 hover:bg-[#1c1c21]"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <section>
            <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <Newspaper className="text-blue-500" size={20} />
                <h2 className="text-xl font-bold tracking-tight text-white">Market News</h2>
              </div>
            </div>
            <div className="space-y-4">
              {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div> : 
                news.length > 0 ? news.map((item: any, idx) => (
                <div key={idx} className="bg-[#151518] p-6 rounded-2xl border border-gray-900 hover:border-gray-700 transition-all">
                  <h3 className="font-bold text-base mb-3 leading-snug text-gray-100">{item.title}</h3>
                  <a href={item.url} target="_blank" className="text-[10px] text-blue-500 font-black uppercase flex items-center gap-1 hover:underline">Read Story <ExternalLink size={10} /></a>
                </div>
              )) : <p className="text-center py-20 text-gray-700">뉴스가 없습니다.</p>}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <Bell className="text-red-500" size={20} />
                <h2 className="text-xl font-bold tracking-tight text-white">DART Disclosure</h2>
              </div>
            </div>
            <div className="space-y-4">
              {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-500" /></div> : 
                disclosures.length > 0 ? disclosures.map((item: any, idx) => (
                <div key={idx} className="bg-[#151518] p-6 rounded-2xl border border-gray-900 border-l-4 border-l-red-600 hover:border-red-900/30 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-black text-red-500 uppercase">{item.corp_name}</span>
                    <span className="text-[10px] text-gray-600 font-mono">{item.rcept_dt}</span>
                  </div>
                  <h3 className="font-bold text-sm mb-4 text-gray-300 line-clamp-2">{item.report_nm}</h3>
                  <a href={`https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${item.rcept_no}`} target="_blank" className="block text-center py-2.5 bg-red-600/10 text-red-500 text-[10px] font-black rounded-xl hover:bg-red-600 hover:text-white transition-all">VIEW DOCUMENT</a>
                </div>
              )) : <p className="text-center py-20 text-gray-700 font-mono text-xs italic uppercase">No Data Available</p>}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}