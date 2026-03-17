import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sealExecutedPdf } from "@/lib/pdf";
import { logAudit } from "@/lib/audit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    const supabase = await createClient();
    const service = createServiceClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: doc, error: docErr } = await supabase
      .from("documents")
      .select("*, deals!inner(id, title, created_by)")
      .eq("id", documentId)
      .single();
    if (docErr || !doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (doc.deals?.created_by !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data: file } = await supabase.storage
      .from("deal-documents")
      .download(doc.file_path);
    if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });

    const { data: parties } = await service
      .from("deal_parties")
      .select("invite_name, signed_at")
      .eq("deal_id", doc.deal_id)
      .eq("status", "signed");
    const { data: auditLogs } = await service
      .from("audit_logs")
      .select("*")
      .eq("deal_id", doc.deal_id)
      .order("created_at", { ascending: true });

    const sealed = await sealExecutedPdf({
      pdfBytes: await file.arrayBuffer(),
      deal: doc.deals,
      parties: parties || [],
      auditLogs: auditLogs || [],
      sealedAt: new Date(),
    });

    const sealedPath = `${doc.deal_id}/${crypto.randomUUID()}-executed-${doc.name}`;
    const { error: uploadErr } = await supabase.storage
      .from("deal-documents")
      .upload(sealedPath, sealed, { contentType: "application/pdf", upsert: false });
    if (uploadErr) return NextResponse.json({ error: "Seal upload failed" }, { status: 500 });

    const { data: sealedDoc, error: insertErr } = await supabase
      .from("documents")
      .insert({
        deal_id: doc.deal_id,
        name: `Executed - ${doc.name}`,
        file_path: sealedPath,
        file_size: sealed.length,
        file_type: "application/pdf",
        category: doc.category,
        permission: "download",
        watermark: false,
        uploaded_by: user.id,
        is_executed: true,
      })
      .select()
      .single();
    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

    await logAudit({
      dealId: doc.deal_id,
      action: "signature_completed",
      actorId: user.id,
      metadata: { documentId: sealedDoc.id, sealedDocument: doc.name },
    });

    return NextResponse.json({ data: sealedDoc });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
