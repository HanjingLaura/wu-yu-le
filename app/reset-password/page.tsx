"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { apiPath } from "@/lib/base-path";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => setToken(new URLSearchParams(window.location.search).get("token") ?? ""), []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(false);
    const response = await fetch(apiPath("/api/auth/reset-password"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(true);
      setMessage(data.error ?? "无法更新密码。");
      return;
    }
    setMessage(data.message ?? "密码已更新，可以登录。");
  }

  return (
    <AuthShell title="新密码">
      <form className="auth-form" onSubmit={submit}>
        <label>
          新密码
          <input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
        </label>
        {message && <p className={`auth-message${error ? " auth-error" : ""}`}>{message}</p>}
        <button className="auth-submit" disabled={busy}>{busy ? "保存中…" : "保存"}</button>
      </form>
      <div className="auth-links">
        <Link href="/login">登录</Link>
      </div>
    </AuthShell>
  );
}
