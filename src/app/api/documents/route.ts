import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { applyDraftWatermark } from "@/lib/pdf";
import { saveFile } from "@/lib/storage";
import { documentToApi } from "@/lib/serialize";
import { type DocCategory } from "@/types";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const dealId = formData.get("deal_id") as string;
    const name = formData.get("name") as string;
    const category = (formData.get("category") as DocCategory) || "other";
    const permission = (formData.get("permission") as "view_only" | "download") || "view_only";
    const watermark = formData.get("watermark") !== "false";
    const expiresAt = formData.get("expires_at") as string | null;
    const file = formData.get("file") as File;

    if (!dealId || !name || !file) {
      return NextResponse.json(
        { error: "Missing deal_id, name, or file" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 20MB)" }, { status: 400 });
    }

    const deal = await prisma.deal.findFirst({
      where: { id: dealId, createdById: userId },
    });
    if (!deal) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const ext = file.name.split(".").pop() || "pdf";
    const fileName = `${crypto.randomUUID()}-${name.replace(/[^a-zA-Z0-9.-]/g, "_")}.${ext}`;
    const filePath = `${dealId}/${fileName}`;

    const arrayBuf = await file.arrayBuffer();
    const toSave =
      watermark && file.type === "application/pdf"
        ? await applyDraftWatermark(arrayBuf)
        : new Uint8Array(arrayBuf);

    await saveFile(filePath, Buffer.from(toSave));

    const doc = await prisma.document.create({
      data: {
        dealId,
        name,
        filePath,
        fileSize: BigInt(file.size),
        fileType: file.type,
        category,
        permission,
        watermark,
        uploadedById: userId,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    await logAudit({
      dealId,
      action: "document_uploaded",
      actorId: userId,
      metadata: { documentId: doc.id, name, category },
    });

    return NextResponse.json({ data: documentToApi(doc) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
