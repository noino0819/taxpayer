-- 개인정보 수집·이용 동의 내역 관리 테이블
-- 대한민국 개인정보보호법 기준

CREATE TABLE privacy_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('privacy_policy', 'terms_of_service')),
  version TEXT NOT NULL DEFAULT '1.0',
  consented BOOLEAN NOT NULL DEFAULT true,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  withdrawn_at TIMESTAMPTZ
);

CREATE INDEX idx_privacy_consents_user ON privacy_consents(user_id);
CREATE INDEX idx_privacy_consents_type ON privacy_consents(consent_type);

-- RLS
ALTER TABLE privacy_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consents"
  ON privacy_consents FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Anon can insert consents"
  ON privacy_consents FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated can insert consents"
  ON privacy_consents FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- users 테이블에 탈퇴 관련 컬럼 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;
