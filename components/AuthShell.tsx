import "./auth-form.css";

export function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand-lockup">
          <h1 className="auth-brand">WuyuLe</h1>
        </div>
        {title ? <p className="auth-subtitle">{title}</p> : null}
        {children}
      </section>
    </main>
  );
}
