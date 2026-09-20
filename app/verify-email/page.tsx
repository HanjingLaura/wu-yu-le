import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";

export default function VerifyEmailPage() {
  return <AuthShell title="CHECK YOUR INBOX" subtitle="" links={false}><p className="auth-message">验证链接已发送。开发态请复制终端打印的链接，打开后即可完成验证。</p><div className="auth-links"><Link href="/login">Back to sign in</Link></div></AuthShell>;
}
