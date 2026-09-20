"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthShell } from "@/components/AuthShell";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState(""); const [verificationUrl, setVerificationUrl] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setBusy(true); setMessage(""); setVerificationUrl(""); const response = await fetch("/api/auth/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) }); const data = await response.json(); setBusy(false); if (!response.ok) { setMessage(data.error ?? "Unable to create account."); return; } setMessage("Account created. Check your email to verify it before signing in."); setVerificationUrl(data.verificationUrl ?? ""); }
  return <AuthShell title="CREATE ACCOUNT" subtitle=""><form className="auth-form" onSubmit={submit}><label>Name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoComplete="name" /></label><label>Email<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required autoComplete="email" /></label><label>Password<input type="password" minLength={8} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required autoComplete="new-password" /></label>{message && <p className="auth-message">{message}{verificationUrl && <> <a href={verificationUrl}>Verify now</a></>}</p>}<button className="auth-submit" disabled={busy}>{busy ? "CREATING…" : "CREATE ACCOUNT"}</button></form><div className="auth-links"><Link href="/login">已有账号</Link><Link href="/">返回展架</Link></div></AuthShell>;
}
