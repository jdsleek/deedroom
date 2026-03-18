const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

interface SendEmailParams {
  to: { email: string; name?: string }[]
  subject: string
  htmlContent: string
  textContent?: string
}

export async function sendEmail(params: SendEmailParams) {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    console.warn('[SignNest] BREVO_API_KEY not set, skipping email')
    return null
  }

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_SENDER_NAME ?? 'SignNest',
        email: process.env.BREVO_SENDER_EMAIL ?? 'noreply@signnest.com',
      },
      to: params.to,
      subject: params.subject,
      htmlContent: params.htmlContent,
      textContent: params.textContent,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.warn('[SignNest] Brevo email failed (non-fatal):', err)
    return null
  }

  return res.json()
}

export function inviteEmailHtml(args: {
  inviteName: string
  dealTitle: string
  propertyAddress: string
  inviteLink: string
  senderName: string
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FAFAF8;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:40px 24px;">
  <div style="text-align:center;margin-bottom:32px;">
    <div style="display:inline-block;width:48px;height:48px;background:#FF5A3C;border-radius:12px;line-height:48px;text-align:center;">
      <span style="color:white;font-size:24px;font-weight:bold;">S</span>
    </div>
    <h1 style="margin:12px 0 0;font-size:24px;color:#1A1A2E;">SignNest</h1>
  </div>
  <div style="background:white;border-radius:16px;padding:32px;border:1px solid #E8E6E1;">
    <p style="color:#1A1A2E;font-size:16px;margin:0 0 8px;">Hi ${args.inviteName},</p>
    <p style="color:#6B7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
      <strong>${args.senderName}</strong> has invited you to review and sign documents for:
    </p>
    <div style="background:#F5F3EF;border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="margin:0;font-weight:600;color:#1A1A2E;font-size:15px;">${args.dealTitle}</p>
      <p style="margin:4px 0 0;color:#6B7280;font-size:14px;">${args.propertyAddress}</p>
    </div>
    <a href="${args.inviteLink}" style="display:block;text-align:center;background:#FF5A3C;color:white;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:600;font-size:16px;">
      View Deal & Sign
    </a>
    <p style="color:#9CA3AF;font-size:13px;margin:24px 0 0;text-align:center;">
      This link will take you to SignNest where you can review documents and sign securely.
    </p>
  </div>
  <p style="color:#9CA3AF;font-size:12px;text-align:center;margin-top:24px;">
    SignNest — Close property deals. Collect signatures. Build trust.
  </p>
</div>
</body>
</html>`
}
