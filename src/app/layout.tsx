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
        baseTheme: undefined,
        variables: {
          colorPrimary: "#2563eb",
          colorBackground: "#ffffff",
          colorText: "#111111",
          colorTextSecondary: "#374151",
          colorNeutral: "#d1d5db",
          colorInputBackground: "#ffffff",
          colorInputText: "#111111",
          colorDanger: "#dc2626",
          borderRadius: "12px",
        },
        elements: {
          /* 전체 카드 */
          card: "bg-white border border-gray-300 shadow-2xl rounded-2xl",

          /* 헤더 */
          headerTitle: "text-black text-3xl font-extrabold",
          headerSubtitle: "text-gray-700 font-medium",

          /* 소셜 로그인 */
          socialButtonsBlockButton:
            "!bg-white !border !border-gray-300 hover:!bg-gray-100 !shadow-sm",
          socialButtonsBlockButtonText:
            "!text-black !font-bold !opacity-100",
          socialButtonsProviderIcon: "!opacity-100",

          /* 구분선 */
          dividerLine: "!bg-gray-300",
          dividerText: "!text-gray-700 !font-semibold",

          /* 입력 */
          formFieldLabel: "!text-black !font-bold",
          formFieldInput:
            "!bg-white !text-black placeholder:!text-gray-500 !border !border-gray-400",
          formFieldInputShowPasswordButton: "!text-black",

          /* 버튼 */
          formButtonPrimary:
            "!bg-blue-600 hover:!bg-blue-700 !text-white !font-bold",

          /* footer */
          footerActionText: "!text-gray-700 !font-medium",
          footerActionLink: "!text-blue-600 !font-bold",

          /* UserButton dropdown */
          userButtonPopoverCard:
            "!bg-white !border !border-gray-300 !shadow-xl",
          userButtonPopoverActionButton:
            "!text-black hover:!bg-gray-100",
          userButtonPopoverActionButtonText:
            "!text-black !font-semibold",
          userButtonPopoverFooter: "!hidden",

          /* 계정 */
          identityPreviewText: "!text-black !font-semibold",
          identityPreviewEditButton: "!text-blue-600 !font-bold",
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