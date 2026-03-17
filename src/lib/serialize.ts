/** Convert Prisma camelCase to API snake_case for frontend compatibility */
function dealToApi(d: {
  id: string
  dealType: string
  status: string
  title: string
  propertyAddress: string
  propertyType: string | null
  description: string | null
  rentAmount: bigint | null
  rentPeriod: string | null
  rentStartDate: Date | null
  rentEndDate: Date | null
  cautionFee: bigint | null
  agencyFee: bigint | null
  legalFee: bigint | null
  salePrice: bigint | null
  createdById: string
  completedAt: Date | null
  cancelledAt: Date | null
  cancelReason: string | null
  createdAt: Date
  updatedAt: Date
  [k: string]: unknown
}) {
  return {
    id: d.id,
    deal_type: d.dealType,
    status: d.status,
    title: d.title,
    property_address: d.propertyAddress,
    property_type: d.propertyType,
    description: d.description,
    rent_amount: d.rentAmount != null ? Number(d.rentAmount) : null,
    rent_period: d.rentPeriod,
    rent_start_date: d.rentStartDate?.toISOString().slice(0, 10) ?? null,
    rent_end_date: d.rentEndDate?.toISOString().slice(0, 10) ?? null,
    caution_fee: d.cautionFee != null ? Number(d.cautionFee) : null,
    agency_fee: d.agencyFee != null ? Number(d.agencyFee) : null,
    legal_fee: d.legalFee != null ? Number(d.legalFee) : null,
    sale_price: d.salePrice != null ? Number(d.salePrice) : null,
    created_by: d.createdById,
    completed_at: d.completedAt?.toISOString() ?? null,
    cancelled_at: d.cancelledAt?.toISOString() ?? null,
    cancel_reason: d.cancelReason,
    created_at: d.createdAt.toISOString(),
    updated_at: d.updatedAt.toISOString(),
  }
}

export { dealToApi }

export function serializeDeal(d: Parameters<typeof dealToApi>[0] & { _count?: { parties?: number; documents?: number } }) {
  const base = dealToApi(d)
  if (d._count) {
    return { ...base, party_count: d._count.parties ?? 0, document_count: d._count.documents ?? 0 }
  }
  return base
}

export function partyToApi(p: {
  id: string
  dealId: string
  userId: string | null
  role: string
  status: string
  inviteName: string
  invitePhone: string | null
  inviteEmail: string | null
  inviteToken: string
  invitedAt: Date
  viewedAt: Date | null
  signedAt: Date | null
  declinedAt: Date | null
  createdAt: Date
  updatedAt: Date
  [k: string]: unknown
}) {
  return {
    id: p.id,
    deal_id: p.dealId,
    user_id: p.userId,
    role: p.role,
    status: p.status,
    invite_name: p.inviteName,
    invite_phone: p.invitePhone,
    invite_email: p.inviteEmail,
    invite_token: p.inviteToken,
    invited_at: p.invitedAt.toISOString(),
    viewed_at: p.viewedAt?.toISOString() ?? null,
    signed_at: p.signedAt?.toISOString() ?? null,
    declined_at: p.declinedAt?.toISOString() ?? null,
    created_at: p.createdAt.toISOString(),
    updated_at: p.updatedAt.toISOString(),
  }
}

export function documentToApi(d: {
  id: string
  dealId: string
  name: string
  filePath: string
  fileSize: bigint | null
  fileType: string | null
  category: string
  permission: string
  watermark: boolean
  uploadedById: string
  expiresAt: Date | null
  isExecuted: boolean
  version: number
  createdAt: Date
  updatedAt: Date
  [k: string]: unknown
}) {
  return {
    id: d.id,
    deal_id: d.dealId,
    name: d.name,
    file_path: d.filePath,
    file_size: d.fileSize != null ? Number(d.fileSize) : null,
    file_type: d.fileType,
    category: d.category,
    permission: d.permission,
    watermark: d.watermark,
    uploaded_by: d.uploadedById,
    expires_at: d.expiresAt?.toISOString() ?? null,
    is_executed: d.isExecuted,
    version: d.version,
    created_at: d.createdAt.toISOString(),
    updated_at: d.updatedAt.toISOString(),
  }
}

export function sigRequestToApi(s: {
  id: string
  documentId: string
  partyId: string
  signedAt: Date | null
  [k: string]: unknown
}) {
  return {
    id: s.id,
    document_id: s.documentId,
    party_id: s.partyId,
    signed_at: s.signedAt?.toISOString() ?? null,
  }
}
