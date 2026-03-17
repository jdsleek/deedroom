-- DeedRoom Database Schema
-- Run in Supabase SQL Editor in order

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE deal_type     AS ENUM ('rent', 'sale');
CREATE TYPE deal_status   AS ENUM ('draft', 'sent', 'viewing', 'signing', 'completed', 'cancelled');
CREATE TYPE party_role    AS ENUM ('agent', 'landlord', 'tenant', 'buyer', 'developer', 'lawyer');
CREATE TYPE party_status  AS ENUM ('invited', 'viewed', 'signing', 'signed', 'declined');
CREATE TYPE doc_category  AS ENUM ('id', 'cac', 'survey', 'agreement', 'receipt', 'checklist', 'approval', 'other');
CREATE TYPE doc_permission AS ENUM ('view_only', 'download');
CREATE TYPE user_role     AS ENUM ('realtor', 'landlord', 'tenant', 'buyer', 'developer', 'lawyer', 'admin');
CREATE TYPE kyc_status    AS ENUM ('pending', 'submitted', 'verified', 'failed');
CREATE TYPE audit_action  AS ENUM (
  'deal_created','deal_updated','deal_completed','deal_cancelled',
  'party_invited','party_viewed','party_signed','party_declined',
  'document_uploaded','document_viewed','document_downloaded','document_deleted',
  'otp_requested','otp_verified','otp_failed',
  'signature_placed','signature_completed'
);

-- PROFILES (auto-created on auth.user insert)
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  phone         TEXT,
  email         TEXT,
  role          user_role NOT NULL DEFAULT 'realtor',
  company_name  TEXT,
  kyc_status    kyc_status NOT NULL DEFAULT 'pending',
  kyc_data      JSONB DEFAULT '{}',
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, phone) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- DEALS
CREATE TABLE deals (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_type        deal_type NOT NULL,
  status           deal_status NOT NULL DEFAULT 'draft',
  title            TEXT NOT NULL,
  property_address TEXT NOT NULL,
  property_type    TEXT,
  description      TEXT,
  rent_amount      BIGINT,
  rent_period      TEXT,
  rent_start_date  DATE,
  rent_end_date    DATE,
  caution_fee      BIGINT,
  agency_fee       BIGINT,
  legal_fee        BIGINT,
  sale_price       BIGINT,
  created_by       UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  completed_at     TIMESTAMPTZ,
  cancelled_at     TIMESTAMPTZ,
  cancel_reason    TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX idx_deals_created_by ON deals(created_by);
CREATE INDEX idx_deals_status ON deals(status);

-- DEAL PARTIES
CREATE TABLE deal_parties (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id        UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  role           party_role NOT NULL,
  status         party_status NOT NULL DEFAULT 'invited',
  invite_name    TEXT NOT NULL,
  invite_phone   TEXT,
  invite_email   TEXT,
  invite_token   TEXT UNIQUE DEFAULT encode(gen_random_bytes(24),'hex'),
  invited_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  viewed_at      TIMESTAMPTZ,
  signed_at      TIMESTAMPTZ,
  declined_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(deal_id, invite_phone),
  CONSTRAINT check_invite_contact CHECK (invite_phone IS NOT NULL OR invite_email IS NOT NULL)
);
CREATE TRIGGER deal_parties_updated_at BEFORE UPDATE ON deal_parties FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX idx_deal_parties_deal_id ON deal_parties(deal_id);
CREATE INDEX idx_deal_parties_token   ON deal_parties(invite_token);

-- DOCUMENTS
CREATE TABLE documents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id        UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  file_path      TEXT NOT NULL,
  file_size      BIGINT,
  file_type      TEXT,
  category       doc_category NOT NULL DEFAULT 'other',
  permission     doc_permission NOT NULL DEFAULT 'view_only',
  watermark      BOOLEAN NOT NULL DEFAULT TRUE,
  uploaded_by    UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  expires_at     TIMESTAMPTZ,
  is_executed    BOOLEAN NOT NULL DEFAULT FALSE,
  version        INTEGER NOT NULL DEFAULT 1,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX idx_documents_deal_id ON documents(deal_id);

-- SIGNATURE REQUESTS
CREATE TABLE signature_requests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id          UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  document_id      UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  party_id         UUID NOT NULL REFERENCES deal_parties(id) ON DELETE CASCADE,
  otp_pin_id       TEXT,
  otp_expires_at   TIMESTAMPTZ,
  otp_attempts     INTEGER NOT NULL DEFAULT 0,
  otp_verified_at  TIMESTAMPTZ,
  signature_data   TEXT,
  signed_at        TIMESTAMPTZ,
  ip_address       INET,
  user_agent       TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(document_id, party_id)
);
CREATE TRIGGER sig_req_updated_at BEFORE UPDATE ON signature_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX idx_sig_req_deal_id  ON signature_requests(deal_id);
CREATE INDEX idx_sig_req_party_id ON signature_requests(party_id);

-- AUDIT LOGS (append-only)
CREATE TABLE audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id      UUID REFERENCES deals(id) ON DELETE SET NULL,
  action       audit_action NOT NULL,
  actor_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_name   TEXT,
  actor_phone  TEXT,
  metadata     JSONB DEFAULT '{}',
  ip_address   INET,
  user_agent   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_deal_id  ON audit_logs(deal_id);
CREATE INDEX idx_audit_created  ON audit_logs(created_at DESC);

-- ROW LEVEL SECURITY
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_parties       ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents          ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs         ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_self_read"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Deals
CREATE POLICY "deals_creator_all"  ON deals FOR ALL USING (auth.uid() = created_by);
CREATE POLICY "deals_party_read"   ON deals FOR SELECT USING (
  EXISTS (SELECT 1 FROM deal_parties dp WHERE dp.deal_id = deals.id AND dp.user_id = auth.uid())
);

-- Deal parties
CREATE POLICY "deal_parties_creator_all" ON deal_parties FOR ALL USING (
  EXISTS (SELECT 1 FROM deals d WHERE d.id = deal_id AND d.created_by = auth.uid())
);
CREATE POLICY "deal_parties_self_read" ON deal_parties FOR SELECT USING (user_id = auth.uid());

-- Documents
CREATE POLICY "documents_creator_all" ON documents FOR ALL USING (
  EXISTS (SELECT 1 FROM deals d WHERE d.id = deal_id AND d.created_by = auth.uid())
);
CREATE POLICY "documents_party_read" ON documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM deal_parties dp WHERE dp.deal_id = documents.deal_id AND dp.user_id = auth.uid())
);

-- Signature requests
CREATE POLICY "sig_req_creator_read" ON signature_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM deals d WHERE d.id = deal_id AND d.created_by = auth.uid())
);
CREATE POLICY "sig_req_party_all" ON signature_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM deal_parties dp WHERE dp.id = party_id AND dp.user_id = auth.uid())
);

-- Audit logs
CREATE POLICY "audit_creator_read" ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM deals d WHERE d.id = deal_id AND d.created_by = auth.uid())
);

-- HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION is_deal_participant(p_deal_id UUID, p_user_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM deals d WHERE d.id = p_deal_id AND d.created_by = p_user_id
    UNION
    SELECT 1 FROM deal_parties dp WHERE dp.deal_id = p_deal_id AND dp.user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION check_deal_completion(p_deal_id UUID) RETURNS VOID AS $$
DECLARE total_parties INTEGER; signed_parties INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_parties FROM deal_parties WHERE deal_id = p_deal_id;
  SELECT COUNT(*) INTO signed_parties FROM deal_parties WHERE deal_id = p_deal_id AND status = 'signed';
  IF total_parties > 0 AND total_parties = signed_parties THEN
    UPDATE deals SET status = 'completed', completed_at = NOW() WHERE id = p_deal_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
