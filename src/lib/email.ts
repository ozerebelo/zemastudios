/**
 * Transactional email is optional. With no RESEND_API_KEY configured the
 * message is logged instead, so the app is fully usable by copying the share
 * link out of the dashboard by hand.
 */
type SendArgs = {
  to: string;
  subject: string;
  text: string;
};

export async function sendEmail({ to, subject, text }: SendArgs): Promise<
  { delivered: boolean; reason?: string }
> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.info(
      `[email] not configured, logging instead\n  to: ${to}\n  subject: ${subject}\n\n${text}\n`,
    );
    return { delivered: false, reason: "email_not_configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, text }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`[email] send failed (${response.status}): ${body}`);
    return { delivered: false, reason: `provider_error_${response.status}` };
  }

  return { delivered: true };
}
