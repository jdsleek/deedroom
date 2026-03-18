import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { documentToApi } from "@/lib/serialize";
import { can } from "@/lib/rbac";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.profile.findUnique({ where: { id: userId }, select: { role: true } });
    if (!profile || !can(profile.role, "review_document")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const doc = await prisma.document.findUnique({
      where: { id },
      include: {
        deal: { select: { createdById: true }, include: { parties: { select: { userId: true, role: true } } } },
      },
    });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isCreator = doc.deal.createdById === userId;
    const isParty = doc.deal.parties.some((p) => p.userId === userId);
    const isLawyerParty = doc.deal.parties.some((p) => p.userId === userId && p.role === "lawyer");
    const isProfileLawyer = profile.role === "lawyer";

    if (!isCreator && !isParty) {
      return NextResponse.json({ error: "Forbidden: not a party to this deal" }, { status: 403 });
    }
    if (!isLawyerParty && !isProfileLawyer) {
      return NextResponse.json({ error: "Forbidden: must be a lawyer party or have lawyer profile role" }, { status: 403 });
    }

    const updated = await prisma.document.update({
      where: { id },
      data: { reviewedById: userId, reviewedAt: new Date() },
    });

    await logAudit({
      dealId: doc.dealId,
      action: "document_reviewed",
      actorId: userId,
      actorName: session?.user?.name ?? session?.user?.email ?? undefined,
      metadata: { documentId: id, name: doc.name },
    });

    const reviewedByProfile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true },
    });

    return NextResponse.json({
      data: documentToApi({
        ...updated,
        reviewedByProfile: reviewedByProfile ?? undefined,
      }),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
