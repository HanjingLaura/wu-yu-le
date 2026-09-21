import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";

export default function VerifyEmailPage() {
  return (
    <AuthShell title="">
      <p className="auth-message">验证链接已发送。没有邮件时，请使用页面上返回的链接完成验证。</p>
      <div className="auth-links">
        <Link href="/login">登录</Link>
      </div>
    </AuthShell>
  );
}
