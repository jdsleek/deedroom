import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendOtp } from "@/lib/termii";
import { logAudit } from "@/lib/audit";

const OTP_COOLDOWN_MS = 10 * 60 * 1000; // 10 min
const MAX_SENDS_PER_COOLDOWN = 3;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { signature_request_id, channel = "sms" } = body;
    if (!signature_request_id) {
      return NextResponse.json(
        { error: "Missing signature_request_id" },
        { status: 400 }
      );
    }

    const { data: sigReq, error: sigErr } = await supabase
      .from("signature_requests")
      .select("*, deal_parties!inner(invite_phone, invite_name, deal_id)")
      .eq("id", signature_request_id)
      .single();
    if (sigErr || !sigReq) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const phone = sigReq.deal_parties?.invite_phone;
    if (!phone) return NextResponse.json({ error: "Party has no phone" }, { status: 400 });

    // Rate limit: check recent OTP sends (stored in metadata for simplicity - we use otp_attempts)
    const { data: recent } = await supabase
      .from("audit_logs")
      .select("created_at")
      .eq("deal_id", sigReq.deal_id)
      .eq("action", "otp_requested")
      .gte("created_at", new Date(Date.now() - OTP_COOLDOWN_MS).toISOString());
    if (recent && recent.length >= MAX_SENDS_PER_COOLDOWN) {
      return NextResponse.json(
        { error: "Too many OTP requests. Try again later." },
        { status: 429 }
      );
    }

    const result = await sendOtp(
      phone,
      channel as "sms" | "whatsapp",
      `DeedRoom: Signing as ${sigReq.deal_parties?.invite_name || "party"}`
    );
    if (!result?.pinId) return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });

    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || "10", 10);
    const otpExpiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString();
    await supabase
      .from("signature_requests")
      .update({
        otp_pin_id: result.pinId,
        otp_expires_at: otpExpiresAt,
      })
      .eq("id", signature_request_id);

    await logAudit({
      dealId: sigReq.deal_id,
      action: "otp_requested",
      actorId: user.id,
      actorPhone: phone,
      metadata: { signatureRequestId: signature_request_id },
    });

    return NextResponse.json({ data: { expires_at: otpExpiresAt } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
