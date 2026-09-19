"use client";

import { FormEvent, useState } from "react";
import { AuthShell } from "@/components/AuthShell";

export default function ForgotPasswordPage() { const [email, setEmail] = useState(""); const [message, setMessage] = useState(""); const [resetUrl, setResetUrl] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) }); const data = await response.json(); setMessage(response.ok ? "If that email exists, a reset link is on its way." : data.error); setResetUrl(data.resetUrl ?? ""); }
  return <AuthShell title="RESET PASSWORD" subtitle=""><form className="auth-form" onSubmit={submit}><label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" /></label>{message && <p className="auth-message">{message}{resetUrl && <> <a href={resetUrl}>Open reset link</a></>}</p>}<button className="auth-submit">SEND RESET LINK</button></form></AuthShell>; }
