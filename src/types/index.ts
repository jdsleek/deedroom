export type DealType = "rent" | "sale";
export type DealStatus =
  | "draft"
  | "sent"
  | "viewing"
  | "signing"
  | "completed"
  | "cancelled";
export type PartyRole =
  | "agent"
  | "landlord"
  | "tenant"
  | "buyer"
  | "developer"
  | "lawyer";
export type PartyStatus =
  | "invited"
  | "viewed"
  | "signing"
  | "signed"
  | "declined";
export type DocCategory =
  | "id"
  | "cac"
  | "survey"
  | "agreement"
  | "receipt"
  | "checklist"
  | "approval"
  | "other";
export type DocPermission = "view_only" | "download";
export type UserRole =
  | "realtor"
  | "landlord"
  | "tenant"
  | "buyer"
  | "developer"
  | "lawyer"
  | "admin";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  role: UserRole;
  company_name: string | null;
  kyc_status: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  deal_type: DealType;
  status: DealStatus;
  title: string;
  property_address: string;
  property_type: string | null;
  description: string | null;
  rent_amount: number | null;
  rent_period: string | null;
  rent_start_date: string | null;
  rent_end_date: string | null;
  caution_fee: number | null;
  agency_fee: number | null;
  legal_fee: number | null;
  sale_price: number | null;
  created_by: string;
  completed_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  created_at: string;
  updated_at: string;
  parties?: DealParty[];
  documents?: Document[];
  signature_requests?: SignatureRequest[];
}

export interface DealParty {
  id: string;
  deal_id: string;
  user_id: string | null;
  role: PartyRole;
  status: PartyStatus;
  invite_name: string;
  invite_phone: string | null;
  invite_email: string | null;
  invite_token: string;
  invited_at: string;
  viewed_at: string | null;
  signed_at: string | null;
  declined_at: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Document {
  id: string;
  deal_id: string;
  name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  category: DocCategory;
  permission: DocPermission;
  watermark: boolean;
  uploaded_by: string;
  expires_at: string | null;
  is_executed: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  uploader?: Profile;
  url?: string;
}

export interface SignatureRequest {
  id: string;
  deal_id: string;
  document_id: string;
  party_id: string;
  otp_pin_id: string | null;
  otp_expires_at: string | null;
  otp_attempts: number;
  otp_verified_at: string | null;
  signature_data: string | null;
  signed_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  deal_id: string | null;
  action: string;
  actor_id: string | null;
  actor_name: string | null;
  actor_phone: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export type Kobo = number;
export const toNairaHelper = (k: Kobo) => k / 100;
export const toKoboHelper = (n: number) => Math.round(n * 100);
export const formatNairaHelper = (k: Kobo) =>
  `₦${(k / 100).toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;
export const formatNaira = formatNairaHelper;
export const toKobo = toKoboHelper;
export const toNaira = toNairaHelper;

export const DEAL_STATUS_CONFIG = {
  draft: { label: "Draft", color: "gray" },
  sent: { label: "Sent", color: "blue" },
  viewing: { label: "Viewing", color: "purple" },
  signing: { label: "Signing", color: "yellow" },
  completed: { label: "Completed", color: "green" },
  cancelled: { label: "Cancelled", color: "red" },
} as const;

export const PARTY_ROLE_LABELS: Record<PartyRole, string> = {
  agent: "Agent / Realtor",
  landlord: "Landlord",
  tenant: "Tenant",
  buyer: "Buyer",
  developer: "Developer",
  lawyer: "Lawyer",
};
