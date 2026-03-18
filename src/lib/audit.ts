/**
 * Audit logging helper - uses Prisma
 */

import { prisma } from "@/lib/db";

const auditActions = [
  "deal_created",
  "deal_updated",
  "deal_completed",
  "deal_cancelled",
  "party_invited",
  "party_viewed",
  "party_signed",
  "party_declined",
  "document_uploaded",
  "document_viewed",
  "document_downloaded",
  "document_deleted",
  "document_reviewed",
  "otp_requested",
  "otp_verified",
  "otp_failed",
  "signature_placed",
  "signature_completed",
  "payment_created",
  "payment_updated",
  "payment_deleted",
  "payment_verified",
  "dispute_raised",
  "dispute_resolved",
] as const;

export type AuditAction = (typeof auditActions)[number];

export interface LogAuditParams {
  dealId?: string | null;
  action: AuditAction;
  actorId?: string | null;
  actorName?: string | null;
  actorPhone?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function logAudit(params: LogAuditParams): Promise<void> {
  await prisma.auditLog.create({
    data: {
      dealId: params.dealId ?? null,
      action: params.action,
      actorId: params.actorId ?? null,
      actorName: params.actorName ?? null,
      actorPhone: params.actorPhone ?? null,
      metadata: (params.metadata ?? {}) as object,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    },
  });
}
