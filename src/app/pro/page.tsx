"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useUser } from "@clerk/nextjs";

export default function ProPage() {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const { user, isSignedIn } = useUser();

  const handlePay = async () => {
    // 로그인 안했으면 로그인 페이지 이동
    if (!isSignedIn || !user) {
      alert("로그인이 필요합니다.");
      window.location.href = "/sign-in";
      return;
    }

    try {
      setLoading(true);

      console.log("결제 함수 실행됨");

      const { data, error } = await supabase
        .from("users")
        .upsert(
          {
            clerk_id: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            is_pro: true,
          },
          {
            onConflict: "clerk_id",
          }
        );

      console.log(data);
      console.log(error);

      // DB 저장 실패
      if (error) {
        alert("DB 저장 실패");
        setLoading(false);
        return;
      }

      // 성공
      alert("PRO 결제 완료!");

      router.push("/");

    } catch (err) {
      console.log(err);
      alert("결제 처리 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">

      {/* HEADER */}
      <header className="border-b border-white/10 bg-[#111114] px-6 py-5">
        <h1 className="text-3xl font-bold tracking-tight">
          STOCKDATA <span className="text-blue-500">PRO</span>
        </h1>
      </header>

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-6 pt-20 text-center">

        <h2 className="text-5xl font-extrabold leading-tight mb-6">
          AI 기반 투자 뉴스 분석 플랫폼
        </h2>

        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          복잡한 뉴스와 공시를 AI가 빠르게 요약하고
          핵심 투자 포인트를 정리합니다.
        </p>

      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="bg-[#111114] border border-yellow-500/20 rounded-3xl p-6">
          <div className="text-3xl mb-4">🧠</div>

          <h3 className="font-bold text-xl mb-2">
            AI 뉴스 요약
          </h3>

          <p className="text-gray-400 text-sm">
            긴 뉴스를 핵심만 빠르게 요약합니다.
          </p>
        </div>

        <div className="bg-[#111114] border border-yellow-500/20 rounded-3xl p-6">
          <div className="text-3xl mb-4">⚡</div>

          <h3 className="font-bold text-xl mb-2">
            속보 우선 제공
          </h3>

          <p className="text-gray-400 text-sm">
            시장 핵심 뉴스를 더 빠르게 확인하세요.
          </p>
        </div>

        <div className="bg-[#111114] border border-yellow-500/20 rounded-3xl p-6">
          <div className="text-3xl mb-4">📊</div>

          <h3 className="font-bold text-xl mb-2">
            DART 공시 분석
          </h3>

          <p className="text-gray-400 text-sm">
            어려운 공시 내용을 AI가 쉽게 정리합니다.
          </p>
        </div>

        <div className="bg-[#111114] border border-yellow-500/20 rounded-3xl p-6">
          <div className="text-3xl mb-4">🚨</div>

          <h3 className="font-bold text-xl mb-2">
            리스크 탐지
          </h3>

          <p className="text-gray-400 text-sm">
            악재 가능성을 빠르게 파악할 수 있습니다.
          </p>
        </div>

      </section>

      {/* PRICE */}
      <section className="pb-24 px-6">

        <div className="max-w-md mx-auto bg-[#111114] border border-yellow-500/30 rounded-3xl p-8">

          <h2 className="text-3xl font-bold mb-4 text-center">
            🚀 STOCKDATA PRO
          </h2>

          <p className="text-gray-400 text-center mb-8">
            PRO 기능을 활성화하고 더 빠르게 투자하세요
          </p>

          <div className="bg-yellow-400 text-black text-center py-4 rounded-2xl font-bold text-3xl mb-6">
            ₩4,900 / 월
          </div>

          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-300 transition text-black font-bold py-4 rounded-2xl text-lg"
          >
            {loading
              ? "결제 진행중..."
              : "결제 진행하기"}
          </button>

        </div>

      </section>

    </main>
  );
}