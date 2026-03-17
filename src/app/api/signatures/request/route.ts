import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { deal_id, document_id, party_id } = body;
    if (!deal_id || !document_id || !party_id) {
      return NextResponse.json(
        { error: "Missing deal_id, document_id, or party_id" },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from("signature_requests")
      .select("*")
      .eq("document_id", document_id)
      .eq("party_id", party_id)
      .single();
    if (existing) return NextResponse.json({ data: existing });

    const { data: sigReq, error } = await supabase
      .from("signature_requests")
      .insert({ deal_id, document_id, party_id })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: sigReq });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
