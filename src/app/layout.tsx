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
          colorBackground: "#0A0B0E",
          colorText: "#ffffff",
          colorInputBackground: "#151518",
          colorInputText: "#ffffff",
        },
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