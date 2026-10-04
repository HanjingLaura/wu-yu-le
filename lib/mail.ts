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

/** Never fail the account flow just because SMTP is missing; callers can return the link. */
export async function sendOrReturnLink(payload: { to: string; subject: string; text: string }) {
  try {
    return await sendTransactionalEmail(payload);
  } catch (error) {
    console.error("mail failed", error);
    return { delivered: false as const, preview: payload.text.match(/https?:\/\/\S+/)?.[0] };
  }
}

/** Dev-only: expose verification/reset URLs in API JSON. Never do this in production. */
export function allowDevMailLinks() {
  if (process.env.NODE_ENV === "production") return false;
  const mode = process.env.MAIL_MODE ?? "console";
  return mode === "console";
}
