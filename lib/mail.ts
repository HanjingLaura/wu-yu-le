/**
 * Mail transport seam. In development, links are printed and returned by the API
 * so the complete verification/reset flow can be tested without credentials.
 * Set RESEND_API_KEY in production or replace this function with SMTP/Ethereal.
 */
export async function sendTransactionalEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const mode = process.env.MAIL_MODE ?? (apiKey ? "resend" : "console");
  const from = process.env.RESEND_FROM ?? process.env.EMAIL_FROM ?? "WuyuLe <onboarding@resend.dev>";

  if (mode === "resend" && apiKey) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, text }),
    });
    if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
    return { delivered: true, preview: undefined };
  }

  console.info(`[wuyule mail] ${to}\nSubject: ${subject}\n\n${text}`);
  return { delivered: false, preview: text.match(/https?:\/\/\S+/)?.[0] };
}
