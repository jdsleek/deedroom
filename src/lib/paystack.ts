const PAYSTACK_BASE = 'https://api.paystack.co'

function headers() {
  return {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  }
}

export async function initializeTransaction(params: {
  email: string
  amount: number
  reference: string
  callbackUrl: string
  metadata?: Record<string, unknown>
}) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      email: params.email,
      amount: params.amount,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  })
  const data = await res.json()
  if (!data.status) throw new Error(data.message ?? 'Paystack init failed')
  return data.data as { authorization_url: string; access_code: string; reference: string }
}

export async function verifyTransaction(reference: string) {
  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: headers() },
  )
  const data = await res.json()
  if (!data.status) throw new Error(data.message ?? 'Paystack verify failed')
  return data.data as { status: string; amount: number; reference: string; paid_at: string }
}
