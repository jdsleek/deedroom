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

    const doc = await prisma.document.findUnique({
      where: { id },
      include: { deal: { select: { createdById: true } } },
    });
    if (!doc)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    let authorized = false;

    if (userId) {
      const isCreator = doc.deal.createdById === userId;
      if (isCreator) {
        authorized = true;
      } else {
        const [party, profile] = await Promise.all([
          prisma.dealParty.findFirst({ where: { dealId: doc.dealId, userId } }),
          prisma.profile.findUnique({ where: { id: userId }, select: { role: true } }),
        ]);
        if (party || profile?.role === "admin") authorized = true;
      }
    }

    if (!authorized) {
      const token = request.nextUrl.searchParams.get("token");
      if (token) {
        const party = await prisma.dealParty.findFirst({
          where: { inviteToken: token },
          select: { dealId: true },
        });
        if (party && doc.dealId === party.dealId) {
          authorized = true;
        }
      }
    }

    if (!authorized)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (doc.expiresAt && new Date(doc.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Link expired" }, { status: 410 });
    }

    const wantsDownload = request.nextUrl.searchParams.get("dl") === "1";
    if (wantsDownload && doc.permission === "view_only") {
      return NextResponse.json(
        { error: "This document is view-only and cannot be downloaded" },
        { status: 403 }
      );
    }

    const buffer = await getFileStream(doc.filePath);
    const ext = path.extname(doc.filePath).toLowerCase();
    const contentType = MIME_MAP[ext] ?? "application/octet-stream";

    const disposition = wantsDownload
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
