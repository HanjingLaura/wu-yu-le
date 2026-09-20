import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "物语了 · WuyuLe",
  description: "个人故事展架。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
