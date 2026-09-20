"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import { AuthShell } from "@/components/AuthShell";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    const result = await signIn("credentials", { email, password, redirect: false });
    setBusy(false);
    if (result?.ok) window.location.assign("/");
    else setMessage(result?.error === "EMAIL_NOT_VERIFIED" ? "请先打开验证邮件中的链接。" : "Email or password is incorrect.");
  }
  return <AuthShell title="SIGN IN" subtitle=""><form className="auth-form" onSubmit={submit}><label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" /></label><label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" /></label>{message && <p className="auth-message auth-error">{message}</p>}<button className="auth-submit" disabled={busy}>{busy ? "SIGNING IN…" : "SIGN IN"}</button></form><div className="auth-links"><Link href="/forgot-password">Forgot password</Link><Link href="/">返回展架</Link></div></AuthShell>;
}
