import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { saveFile } from "@/lib/storage";
import { documentToApi } from "@/lib/serialize";
import { TEMPLATES } from "@/lib/templates";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { DocCategory } from "@/types";

export async function GET() {
  const list = TEMPLATES.map(({ content: _content, ...rest }) => rest);
  return NextResponse.json({ data: list });
}

const LINE_HEIGHT = 16;
const MARGIN_X = 50;
const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const USABLE_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

function wrapText(text: string, font: Awaited<ReturnType<PDFDocument['embedFont']>>, fontSize: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const raw of text.split('\n')) {
    if (raw.trim() === '') {
      lines.push('');
      continue;
    }
    const words = raw.split(' ');
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(test, fontSize) > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

async function textToPdf(text: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontSize = 11;

  const allLines = wrapText(text, font, fontSize, USABLE_WIDTH);

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - 60;

  for (const line of allLines) {
    if (y < 60) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - 60;
    }

    const isHeader = /^[A-Z][A-Z\s—–\-:]+$/.test(line.trim()) && line.trim().length > 2;
    const chosenFont = isHeader ? fontBold : font;
    const chosenSize = isHeader ? 13 : fontSize;

    page.drawText(line, {
      x: MARGIN_X,
      y,
      size: chosenSize,
      font: chosenFont,
      color: rgb(0.1, 0.1, 0.1),
    });

    y -= LINE_HEIGHT;
  }

  return doc.save();
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { templateId, dealId, values } = body as {
      templateId: string;
      dealId: string;
      values: Record<string, string>;
    };

    if (!templateId || !dealId || !values) {
      return NextResponse.json(
        { error: "Missing templateId, dealId, or values" },
        { status: 400 }
      );
    }

    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const deal = await prisma.deal.findFirst({
      where: { id: dealId, createdById: userId },
    });
    if (!deal) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const missing = template.fields
      .filter((f) => f.required && !values[f.key]?.trim())
      .map((f) => f.label);

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const textContent = template.content(values);
    const pdfBytes = await textToPdf(textContent);

    const fileName = `${crypto.randomUUID()}-${template.id}.pdf`;
    const filePath = `${dealId}/${fileName}`;
    await saveFile(filePath, Buffer.from(pdfBytes));

    const doc = await prisma.document.create({
      data: {
        dealId,
        name: template.name,
        filePath,
        fileSize: BigInt(pdfBytes.length),
        fileType: "application/pdf",
        category: template.category as DocCategory,
        permission: "download",
        watermark: false,
        uploadedById: userId,
      },
    });

    await logAudit({
      dealId,
      action: "document_uploaded",
      actorId: userId,
      metadata: { documentId: doc.id, name: template.name, templateId, source: "template" },
    });

    return NextResponse.json({ data: documentToApi(doc) });
  } catch (e) {
    console.error("[Template API]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
