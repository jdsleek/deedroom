import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getFileStream } from "@/lib/storage";
import path from "path";

const MIME_MAP: Record<string, string> = {
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".doc": "application/msword",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userId = (session?.user as { id?: string })?.id;
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const doc = await prisma.document.findUnique({
      where: { id },
      include: { deal: { select: { createdById: true } } },
    });
    if (!doc)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isCreator = doc.deal.createdById === userId;
    if (!isCreator) {
      const party = await prisma.dealParty.findFirst({
        where: { dealId: doc.dealId, userId },
      });
      if (!party)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (doc.expiresAt && new Date(doc.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Link expired" }, { status: 410 });
    }

    const buffer = await getFileStream(doc.filePath);
    const ext = path.extname(doc.filePath).toLowerCase();
    const contentType = MIME_MAP[ext] ?? "application/octet-stream";

    const disposition = request.nextUrl.searchParams.get("dl") === "1"
      ? `attachment; filename="${encodeURIComponent(doc.name)}"`
      : `inline; filename="${encodeURIComponent(doc.name)}"`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": disposition,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (e) {
    console.error("[documents/file]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
