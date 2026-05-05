"use client";
import { useState } from "react";

export default function ProPage() {
  const [loading, setLoading] = useState(false);

  const handlePay = () => {
    setLoading(true);

    setTimeout(() => {
      alert("결제 완료!");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-[#111114] border border-yellow-500/30 rounded-3xl p-8 w-[90%] max-w-md">

        <h1 className="text-2xl font-bold mb-4">🚀 STOCKDATA PRO</h1>

        <p className="text-gray-400 mb-6">
          PRO 기능을 활성화하고 더 빠르게 투자하세요
        </p>

        <div className="bg-yellow-400 text-black text-center py-3 rounded-xl font-bold text-lg mb-6">
          ₩4,900 / 월
        </div>

        <button
          onClick={handlePay}
          className="w-full bg-yellow-400 hover:bg-yellow-300 text-black py-3 rounded-xl font-bold transition"
        >
          {loading ? "결제 진행중..." : "결제 진행하기"}
        </button>

      </div>
    </div>
  );
}