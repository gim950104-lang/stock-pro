'use client';

import { createClient } from '@supabase/supabase-js';

export default function GoogleLoginButton() {
  const handleGoogleLogin = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      alert('환경 변수가 설정되지 않았습니다. Vercel 설정을 확인해 주세요.');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-white bg-[#1A1B23] hover:bg-gray-800 transition-all focus:outline-none"
      >
        Google 계정으로 로그인
      </button>
    </div>
  );
}