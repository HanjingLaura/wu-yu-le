import Link from "next/link";
import "./auth-form.css";

export function AuthShell({ title, subtitle, children, links = true }: { title: string; subtitle: string; children: React.ReactNode; links?: boolean }) {
  return <main className="auth-page"><section className="auth-card"><h1 className="auth-brand">物语了</h1><p className="auth-subtitle">WUYULE · {title}</p>{children}{links && <nav className="auth-links"><Link href="/login">Sign in</Link><Link href="/register">Create account</Link></nav>}</section></main>;
}
