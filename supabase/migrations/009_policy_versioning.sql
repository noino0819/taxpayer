-- 약관/방침 버전 관리 및 개인정보 삭제 이력 관리
-- 대한민국 개인정보보호법 준수

-- ============================================
-- 약관/방침 문서 버전 관리 테이블
-- ============================================

CREATE TABLE policy_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('privacy_policy', 'terms_of_service')),
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  effective_date DATE NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,

  UNIQUE (type, version)
);

CREATE INDEX idx_policy_documents_type ON policy_documents(type);
CREATE INDEX idx_policy_documents_current ON policy_documents(is_current) WHERE is_current = true;

ALTER TABLE policy_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view policy documents"
  ON policy_documents FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can insert policy documents"
  ON policy_documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update policy documents"
  ON policy_documents FOR UPDATE
  TO authenticated
  USING (true);

-- ============================================
-- privacy_consents 테이블에 policy_document FK 추가
-- ============================================

ALTER TABLE privacy_consents
  ADD COLUMN IF NOT EXISTS policy_document_id UUID REFERENCES policy_documents(id) ON DELETE SET NULL;

CREATE INDEX idx_privacy_consents_policy ON privacy_consents(policy_document_id);

-- ============================================
-- 개인정보 삭제 이력 (법적 보관 의무)
-- 통신비밀보호법 3개월, 전자상거래법 5년
-- ============================================

CREATE TABLE account_deletion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_user_id UUID NOT NULL,
  role TEXT NOT NULL,
  deletion_reason TEXT NOT NULL DEFAULT 'user_request',
  deleted_data_summary JSONB NOT NULL DEFAULT '{}',
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  retention_until TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '3 months')
);

CREATE INDEX idx_deletion_logs_retention ON account_deletion_logs(retention_until);

ALTER TABLE account_deletion_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only service can access deletion logs"
  ON account_deletion_logs FOR ALL
  TO authenticated
  USING (false);

CREATE POLICY "Anon can insert deletion logs"
  ON account_deletion_logs FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated can insert deletion logs"
  ON account_deletion_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- 초기 약관 데이터 시딩 (v1.0)
-- ============================================

INSERT INTO policy_documents (type, version, title, content, summary, effective_date, is_current) VALUES
(
  'privacy_policy',
  '1.0',
  '개인정보 수집·이용 동의서',
  E'## 1. 개인정보의 수집·이용 목적\n\n세금 내는 아이들(이하 "서비스")은 학급 화폐 경제 교육 플랫폼 운영을 위해 아래의 목적으로 개인정보를 수집·이용합니다.\n\n- 회원 가입 및 본인 확인\n- 학급 경제 교육 서비스 제공\n- 서비스 이용 기록 관리\n- 서비스 개선 및 통계 분석\n\n## 2. 수집하는 개인정보 항목\n\n**교사**\n[필수] 이름, 이메일 주소, 비밀번호, 학교명, 학년, 반\n\n**학생**\n[필수] 이름, 아이디, 비밀번호, 초대 코드, 아바타 정보\n\n**자동 수집**\n서비스 이용 기록, 접속 일시, 기기 정보\n\n## 3. 개인정보의 보유 및 이용 기간\n\n회원 탈퇴 시 또는 개인정보 수집·이용 목적 달성 시까지 보유하며, 탈퇴 즉시 파기합니다. 단, 관계 법령에 의해 보존할 의무가 있는 경우 해당 기간 동안 보존합니다.\n\n- 전자상거래 등의 소비자보호에 관한 법률: 계약·청약 철회 기록 5년\n- 통신비밀보호법: 접속 로그 기록 3개월\n\n## 4. 개인정보의 제3자 제공\n\n서비스는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다. 다만, 법령에 의해 요구되는 경우는 예외로 합니다.\n\n## 5. 개인정보의 파기 절차 및 방법\n\n목적 달성 후 즉시 파기하며, 전자 파일은 복구 불가능한 방법으로 영구 삭제합니다.\n\n## 6. 이용자의 권리\n\n- 개인정보 열람, 정정, 삭제, 처리 정지를 요청할 권리\n- 언제든지 동의 철회(회원 탈퇴)를 할 권리\n- 만 14세 미만 아동의 경우 법정대리인의 동의가 필요\n\n## 7. 동의 거부권 및 불이익\n\n개인정보 수집·이용에 대한 동의를 거부할 권리가 있습니다. 다만, 필수 항목에 대한 동의를 거부하실 경우 서비스 이용이 제한됩니다.',
  '회원 가입 및 서비스 제공을 위한 개인정보 수집·이용',
  '2026-03-31',
  true
),
(
  'terms_of_service',
  '1.0',
  '서비스 이용약관',
  E'## 제1조 (목적)\n\n이 약관은 세금 내는 아이들(이하 "서비스")이 제공하는 학급 화폐 경제 교육 플랫폼의 이용과 관련하여 서비스와 이용자 간의 권리·의무 및 책임 사항 등을 규정함을 목적으로 합니다.\n\n## 제2조 (서비스의 내용)\n\n- 학급 화폐 시스템 운영 (화폐 발행, 통장 관리)\n- 직업 및 급여 시스템\n- 경제 교육 시뮬레이션 (투자, 보험, 은행, 부동산 등)\n- 학급 내 경제 활동 기록 및 관리\n\n## 제3조 (이용자의 의무)\n\n- 타인의 정보를 도용하거나 허위 정보를 등록하지 않아야 합니다.\n- 서비스의 정상적인 운영을 방해하는 행위를 하지 않아야 합니다.\n- 학급 내 건전한 교육 환경을 유지해야 합니다.\n\n## 제4조 (서비스 이용의 제한)\n\n서비스는 이용자가 본 약관을 위반하거나 서비스의 정상적인 운영을 방해하는 경우 서비스 이용을 제한할 수 있습니다.\n\n## 제5조 (회원 탈퇴 및 자격 상실)\n\n- 이용자는 언제든지 서비스에 탈퇴를 요청할 수 있습니다.\n- 탈퇴 시 해당 이용자의 모든 데이터는 즉시 삭제됩니다.\n- 삭제된 데이터는 복구할 수 없습니다.\n\n## 제6조 (면책 조항)\n\n서비스는 교육 목적으로 제공되며, 서비스 내의 가상 화폐 및 경제 활동은 실제 금전적 가치를 가지지 않습니다.\n\n## 제7조 (분쟁 해결)\n\n서비스 이용과 관련하여 분쟁이 발생한 경우, 서비스와 이용자는 원만하게 해결하기 위해 성실히 협의합니다.',
  '서비스 이용에 관한 권리·의무 및 책임 사항',
  '2026-03-31',
  true
);
