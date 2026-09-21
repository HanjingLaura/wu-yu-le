"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { apiPath } from "@/lib/base-path";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [verificationUrl, setVerificationUrl] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setVerificationUrl("");
    setError(false);
    const response = await fetch(apiPath("/api/auth/register"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(true);
      setMessage(data.error ?? "无法创建账号。");
      return;
    }
    setMessage(data.verificationUrl ? "账号已创建。请打开验证链接后再登录。" : "账号已创建。请查看邮箱中的验证链接后再登录。");
    setVerificationUrl(data.verificationUrl ?? "");
  }

  return (
    <AuthShell title="注册">
      <form className="auth-form" onSubmit={submit}>
        <label>
          姓名
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
        </label>
        <label>
          用户名
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} autoComplete="username" />
        </label>
        <label>
          邮箱
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" />
        </label>
        <label>
          密码
          <input type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required autoComplete="new-password" />
        </label>
        {message && (
          <p className={`auth-message${error ? " auth-error" : ""}`}>
            {message}
            {verificationUrl && (
              <>
                {" "}
                <a href={verificationUrl}>打开验证</a>
              </>
            )}
          </p>
        )}
        <button className="auth-submit" disabled={busy}>{busy ? "注册中…" : "注册"}</button>
      </form>
      <div className="auth-links">
        <Link href="/login">登录</Link>
      </div>
    </AuthShell>
  );
}
