import type { Metadata } from "next";
import "@/lib/styles/globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Chinglish 黑白语言站",
  description: "全球用户共同参与构建的中式英语查询、验证、分享、学习、文化数据库平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased flex flex-col">
        <AuthProvider>
          <Header />
          <main className="flex-1 container py-8">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
