'use client';

import { createClient } from '@supabase/supabase-js';

export default function GoogleLoginButton() {
  // Supabase 공식 클라이언트를 생성합니다.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('로그인 중 오류가 발생했습니다:', error.message);
    }
  };

  return (
    <div className="p-8 bg-white/5 backdrop-blur-md rounded-2xl border border-gray-800 w-full text-center">
      <h1 className="text-2xl font-bold text-white mb-2">환영합니다</h1>
      <p className="text-gray-400 mb-8">구글 계정을 사용하여 시작하세요.</p>

      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-white bg-[#1A1B23] hover:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 22c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.05-3.71 1.05-2.85 0-5.26-1.93-6.12-4.52H2.18v2.85C3.98 20.18 7.74 22 12 22z"
            fill="#34A853"
          />
          <path
            d="M5.88 13.12c-.22-.66-.35-1.37-.35-2.12s.13-1.46.35-2.12V2.85H2.18C1.43 4.34 1 6 1 7.82c0 1.82.43 3.48 1.18 4.97l2.7-2.67z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.74 1 3.98 2.82 2.18 6.53l2.7 2.85C5.74 6.82 8.15 5.38 12 5.38z"
            fill="#EA4335"
          />
        </svg>
        Google 계정으로 로그인
      </button>
    </div>
  );
}