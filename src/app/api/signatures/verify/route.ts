import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyOtp } from "@/lib/termii";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const service = createServiceClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { signature_request_id, otp_code, signature_data } = body;
    if (!signature_request_id || !otp_code || !signature_data) {
      return NextResponse.json(
        { error: "Missing signature_request_id, otp_code, or signature_data" },
        { status: 400 }
      );
    }

    const { data: sigReq, error: sigErr } = await supabase
      .from("signature_requests")
      .select("*, deal_parties!inner(id, user_id, deal_id)")
      .eq("id", signature_request_id)
      .single();
    if (sigErr || !sigReq) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (sigReq.deal_parties?.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!sigReq.otp_pin_id) return NextResponse.json({ error: "OTP not requested" }, { status: 400 });
    if (sigReq.otp_attempts >= 3) {
      return NextResponse.json({ error: "Max attempts exceeded. Request new OTP." }, { status: 429 });
    }

    const { verified } = await verifyOtp(sigReq.otp_pin_id, String(otp_code));
    if (!verified) {
      await supabase
        .from("signature_requests")
        .update({ otp_attempts: (sigReq.otp_attempts || 0) + 1 })
        .eq("id", signature_request_id);
      await logAudit({
        dealId: sigReq.deal_id,
        action: "otp_failed",
        actorId: user.id,
        metadata: { signatureRequestId: signature_request_id },
      });
      return NextResponse.json({ data: { verified: false, deal_completed: false } });
    }

    const headers = request.headers;
    const ip = headers.get("x-forwarded-for")?.split(",")[0] || headers.get("x-real-ip") || null;
    const ua = headers.get("user-agent") || null;

    await supabase
      .from("signature_requests")
      .update({
        otp_verified_at: new Date().toISOString(),
        signature_data,
        signed_at: new Date().toISOString(),
        ip_address: ip,
        user_agent: ua,
      })
      .eq("id", signature_request_id);

    await supabase
      .from("deal_parties")
      .update({ status: "signed", signed_at: new Date().toISOString() })
      .eq("id", sigReq.party_id);

    await logAudit({
      dealId: sigReq.deal_id,
      action: "otp_verified",
      actorId: user.id,
      metadata: { signatureRequestId: signature_request_id },
    });
    await logAudit({
      dealId: sigReq.deal_id,
      action: "party_signed",
      actorId: user.id,
      metadata: { partyId: sigReq.party_id },
    });

    await service.rpc("check_deal_completion", { p_deal_id: sigReq.deal_id });

    const { data: deal } = await service.from("deals").select("status").eq("id", sigReq.deal_id).single();
    const dealCompleted = deal?.status === "completed";

    if (dealCompleted) {
      const { data: docs } = await service
        .from("documents")
        .select("id")
        .eq("deal_id", sigReq.deal_id)
        .eq("is_executed", false)
        .eq("category", "agreement");
      for (const d of docs || []) {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/documents/${d.id}/seal`, {
          method: "POST",
          headers: { Cookie: headers.get("cookie") || "" },
        });
      }
      await logAudit({
        dealId: sigReq.deal_id,
        action: "deal_completed",
        actorId: user.id,
      });
    }

    return NextResponse.json({ data: { verified: true, deal_completed: dealCompleted } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
