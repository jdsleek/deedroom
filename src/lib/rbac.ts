export type Action =
  | 'create_deal'
  | 'invite_party'
  | 'upload_document'
  | 'sign_document'
  | 'view_audit'
  | 'export_evidence'
  | 'manage_users'
  | 'view_admin'

const ROLE_PERMISSIONS: Record<string, Action[]> = {
  realtor: ['create_deal', 'invite_party', 'upload_document', 'sign_document', 'view_audit', 'export_evidence'],
  landlord: ['upload_document', 'sign_document', 'view_audit'],
  tenant: ['upload_document', 'sign_document', 'view_audit'],
  buyer: ['upload_document', 'sign_document', 'view_audit'],
  developer: ['create_deal', 'invite_party', 'upload_document', 'sign_document', 'view_audit', 'export_evidence'],
  lawyer: ['upload_document', 'sign_document', 'view_audit', 'export_evidence'],
  admin: ['create_deal', 'invite_party', 'upload_document', 'sign_document', 'view_audit', 'export_evidence', 'manage_users', 'view_admin'],
}

export function can(role: string, action: Action): boolean {
  return ROLE_PERMISSIONS[role]?.includes(action) ?? false
}

export function requireRole(role: string, action: Action): void {
  if (!can(role, action)) throw new Error(`Role '${role}' cannot perform '${action}'`)
}
