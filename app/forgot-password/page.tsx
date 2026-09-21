"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { apiPath } from "@/lib/base-path";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(false);
    setResetUrl("");
    const response = await fetch(apiPath("/api/auth/forgot-password"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(true);
      setMessage(data.error ?? "无法发送。");
      return;
    }
    setMessage(data.resetUrl ? "重置链接已准备好。" : "如果该邮箱存在，重置链接已发出。");
    setResetUrl(data.resetUrl ?? "");
  }

  return (
    <AuthShell title="忘记密码">
      <form className="auth-form" onSubmit={submit}>
        <label>
          邮箱
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        {message && (
          <p className={`auth-message${error ? " auth-error" : ""}`}>
            {message}
            {resetUrl && (
              <>
                {" "}
                <a href={resetUrl}>打开重置</a>
              </>
            )}
          </p>
        )}
        <button className="auth-submit" disabled={busy}>{busy ? "发送中…" : "发送链接"}</button>
      </form>
      <div className="auth-links">
        <Link href="/login">登录</Link>
      </div>
    </AuthShell>
  );
}
