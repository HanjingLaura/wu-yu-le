"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AuthShell } from "@/components/AuthShell";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const verified = new URLSearchParams(window.location.search).get("verified");
    if (verified === "1") setMessage("邮箱已验证，可以登录。");
    if (verified === "0") {
      setError(true);
      setMessage("验证链接无效或已过期。");
    }
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError(false);
    const result = await signIn("credentials", { email, password, redirect: false });
    setBusy(false);
    if (result?.ok) {
      const next = new URLSearchParams(window.location.search).get("next") ?? "/";
      const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
      router.replace(safeNext);
      return;
    }
    setError(true);
    setMessage(result?.error === "EMAIL_NOT_VERIFIED" ? "请先打开验证链接。" : "邮箱或密码不正确。");
  }

  return (
    <AuthShell title="登录">
      <form className="auth-form" onSubmit={submit}>
        <label>
          邮箱
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>
          密码
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </label>
        {message && <p className={`auth-message${error ? " auth-error" : ""}`}>{message}</p>}
        <button className="auth-submit" disabled={busy}>{busy ? "登录中…" : "登录"}</button>
      </form>
      <div className="auth-links">
        <Link href="/register">注册</Link>
        <Link href="/forgot-password">忘记密码</Link>
      </div>
    </AuthShell>
  );
}
