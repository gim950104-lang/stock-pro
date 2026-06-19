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
            🚀 STOCKDATA BETA
          </h2>

          <p className="text-gray-400 text-center mb-8">
           현재 PRO 기능을 개발 중입니다.
AI 요약 기능을 먼저 체험해보세요.
          </p>

          
          <div className="bg-zinc-800 rounded-2xl p-5 text-center">
  <p className="text-lg font-bold mb-2">
    🚧 PRO 기능 개발 중
  </p>

  <p className="text-gray-400">
    현재 사용자 피드백을 수집하고 있습니다.
  </p>

  <p className="text-green-400 font-bold mt-4">
  gim950104@gmail.com
  </p>
</div>
<button
  onClick={() => router.push("/")}
  className="mt-6 w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-2xl font-bold"
>
  ← 홈으로 돌아가기
</button>
        </div>

      </section>

    </main>
  );
}