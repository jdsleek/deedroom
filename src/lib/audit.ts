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
  "otp_requested",
  "otp_verified",
  "otp_failed",
  "signature_placed",
  "signature_completed",
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
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await supabase.from("audit_logs").insert({
    deal_id: params.dealId ?? null,
    action: params.action,
    actor_id: params.actorId ?? null,
    actor_name: params.actorName ?? null,
    actor_phone: params.actorPhone ?? null,
    metadata: params.metadata ?? {},
    ip_address: params.ipAddress ?? null,
    user_agent: params.userAgent ?? null,
  });
}
