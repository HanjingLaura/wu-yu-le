import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WuyuLe",
  description: "记录物与故事。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
