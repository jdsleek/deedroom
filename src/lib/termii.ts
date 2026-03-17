/**
 * Termii integration for OTP and WhatsApp messaging
 * @see https://termii.com
 */

const TERMII_BASE = "https://api.ng.termii.com/api";

export async function sendOtp(
  phone: string,
  channel: "sms" | "whatsapp",
  context: string
) {
  const res = await fetch(`${TERMII_BASE}/sms/otp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TERMII_API_KEY,
      message_type: "NUMERIC",
      to: phone,
      from: process.env.TERMII_SENDER_ID ?? "DeedRoom",
      channel: channel === "whatsapp" ? "whatsapp" : "generic",
      pin_attempts: 3,
      pin_time_to_live: 10,
      pin_length: 6,
      pin_placeholder: "< 1234 >",
      message_text: `Your DeedRoom code: < 1234 >. Valid 10 mins. ${context}`,
      pin_type: "NUMERIC",
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Termii send OTP failed: ${res.status}`);
  }

  const data = await res.json();
  return { pinId: data.pin_id ?? data.pinId };
}

export async function verifyOtp(pinId: string, code: string) {
  const res = await fetch(`${TERMII_BASE}/sms/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TERMII_API_KEY,
      pin_id: pinId,
      pin: code,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Termii verify OTP failed: ${res.status}`);
  }

  const data = await res.json();
  return { verified: data.verified === "True" };
}

export async function sendWhatsAppInvite(phone: string, message: string) {
  const res = await fetch(`${TERMII_BASE}/sms/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TERMII_API_KEY,
      to: phone,
      from: process.env.TERMII_WHATSAPP_SENDER_ID ?? process.env.TERMII_SENDER_ID,
      sms: message,
      type: "plain",
      channel: "whatsapp",
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.message ?? `Termii WhatsApp send failed: ${res.status}`
    );
  }

  return res.json();
}

export async function sendSms(phone: string, message: string) {
  const res = await fetch(`${TERMII_BASE}/sms/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TERMII_API_KEY,
      to: phone,
      from: process.env.TERMII_SENDER_ID ?? "DeedRoom",
      sms: message,
      type: "plain",
      channel: "generic",
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Termii SMS send failed: ${res.status}`);
  }

  return res.json();
}
