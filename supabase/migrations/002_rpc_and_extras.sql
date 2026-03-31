-- update_balance RPC: 계좌 잔액을 원자적으로 업데이트
CREATE OR REPLACE FUNCTION update_balance(p_account_id UUID, p_amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE accounts SET balance = balance + p_amount WHERE id = p_account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 모듈 변경 로그 테이블
CREATE TABLE IF NOT EXISTS module_change_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('on', 'off')),
  changed_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_module_change_logs_classroom ON module_change_logs(classroom_id);

-- avatar_preset_id를 TEXT로 변경 (이모지 직접 저장)
ALTER TABLE users ALTER COLUMN avatar_preset_id TYPE TEXT;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_avatar_preset_id_fkey;

-- module_configs에 unique constraint 추가 (upsert용)
ALTER TABLE module_configs ADD CONSTRAINT IF NOT EXISTS module_configs_classroom_module_unique 
  UNIQUE (classroom_id, module_name);

-- memberships 테이블 (없으면 생성)
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, classroom_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_classroom ON memberships(classroom_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(user_id);

-- stores에 owner_id를 nullable로 (학교 공식 마트는 owner 없음)
ALTER TABLE stores ALTER COLUMN owner_id DROP NOT NULL;
