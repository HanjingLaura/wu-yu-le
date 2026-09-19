"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AuthShell } from "@/components/AuthShell";

export default function ResetPasswordPage() { const [token, setToken] = useState(""); const [password, setPassword] = useState(""); const [message, setMessage] = useState("");
  useEffect(() => setToken(new URLSearchParams(window.location.search).get("token") ?? ""), []);
  async function submit(event: FormEvent) { event.preventDefault(); const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, password }) }); const data = await response.json(); setMessage(response.ok ? "Password reset. You can sign in now." : data.error); }
  return <AuthShell title="NEW PASSWORD" subtitle=""><form className="auth-form" onSubmit={submit}><label>New password<input type="password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" /></label>{message && <p className="auth-message">{message}</p>}<button className="auth-submit">SAVE PASSWORD</button></form><div className="auth-links"><Link href="/login">Sign in</Link></div></AuthShell>; }
