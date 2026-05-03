import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "STOCKDATA PRO",
  description: "AI + DART + TECH NEWS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#2563eb",
          colorBackground: "#ffffff",
          colorText: "#111827",
          colorTextSecondary: "#6b7280",
          colorInputBackground: "#ffffff",
          colorInputText: "#111827",
          colorNeutral: "#e5e7eb",
        },
        elements: {
          card: "bg-white border border-gray-200 shadow-2xl rounded-2xl",
          headerTitle: "text-gray-900 text-3xl font-bold",
          headerSubtitle: "text-gray-500",
          socialButtonsBlockButton:
            "bg-white border border-gray-300 hover:bg-gray-50 text-gray-900",
          socialButtonsBlockButtonText: "text-gray-900 font-semibold",
          socialButtonsProviderIcon: "brightness-100",
          dividerLine: "bg-gray-200",
          dividerText: "text-gray-400",
          formFieldLabel: "text-gray-700 font-semibold",
          formFieldInput:
            "bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300",
          footerActionText: "text-gray-500",
          footerActionLink: "text-blue-600 font-semibold",
          formButtonPrimary:
            "bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md",
          identityPreviewText: "text-gray-900",
          identityPreviewEditButton: "text-blue-600",
          formResendCodeLink: "text-blue-600",
          otpCodeFieldInput:
            "border border-gray-300 text-gray-900 bg-white",
        },
        layout: {
          socialButtonsPlacement: "top",
          socialButtonsVariant: "blockButton",
        },
      }}
      localization={{
        signIn: {
          start: {
            title: "STOCKDATA PRO 로그인",
            subtitle: "계속하려면 로그인하세요",
          },
        },
        signUp: {
          start: {
            title: "STOCKDATA PRO 회원가입",
            subtitle: "새 계정을 만들어 시작하세요",
          },
        },
        socialButtonsBlockButton: "{{provider}}로 계속하기",
        formFieldLabel__emailAddress: "이메일",
        formFieldInputPlaceholder__emailAddress: "이메일을 입력하세요",
        formFieldLabel__password: "비밀번호",
        formFieldInputPlaceholder__password: "비밀번호를 입력하세요",
        formButtonPrimary: "계속하기",
      }}
    >
      <html
        lang="ko"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-screen bg-[#0A0B0E] text-white">
          {/* 상단 헤더 */}
          <header className="sticky top-0 z-50 flex justify-between items-center px-8 py-4 border-b border-gray-800 bg-[#0A0B0E]/90 backdrop-blur-md">
            <div className="text-2xl font-black tracking-wider text-white">
              STOCKDATA <span className="text-blue-500">PRO</span>
            </div>
          </header>

          {/* 메인 */}
          <main className="min-h-[calc(100vh-80px)]">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}