import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "物语了 · WuyuLe",
  description: "个人收藏的物与故事。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
