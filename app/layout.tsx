import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "物语了 · WuyuLe",
  description: "把那些差点无语的日子，写成以后会笑的故事。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
