import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const doc = await prisma.document.findUnique({
      where: { id },
      include: { deal: { select: { createdById: true } } },
    });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isCreator = doc.deal.createdById === userId;
    let isParty = false;
    if (!isCreator) {
      const party = await prisma.dealParty.findFirst({
        where: { dealId: doc.dealId, userId },
      });
      isParty = !!party;
    }
    if (!isCreator && !isParty) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
    const url = `${baseUrl}/api/documents/${id}/file`;

    const action = request.nextUrl.searchParams.get("action") === "download" ? "document_downloaded" : "document_viewed";
    await logAudit({
      dealId: doc.dealId,
      action,
      actorId: userId,
      metadata: { documentId: id },
    });

    return NextResponse.json({
      data: {
        url,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const doc = await prisma.document.findUnique({
      where: { id },
      include: { deal: { select: { createdById: true } } },
    });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (doc.deal.createdById !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { deleteDocument } = await import("@/lib/storage");
    await deleteDocument(doc.filePath);
    await prisma.document.delete({ where: { id } });

    await logAudit({
      dealId: doc.dealId,
      action: "document_deleted",
      actorId: userId,
      metadata: { documentId: id, name: doc.name },
    });
    return NextResponse.json({ data: { deleted: true } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
