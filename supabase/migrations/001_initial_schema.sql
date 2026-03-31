-- TaxPayer 초기 데이터베이스 스키마
-- 학급 화폐 경제 교육 플랫폼

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('teacher', 'student');
CREATE TYPE economy_mode AS ENUM ('auto', 'semi', 'manual');
CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE transaction_category AS ENUM (
  'salary', 'investment', 'interest', 'business', 'bonus', 'other_income',
  'tax', 'consumption', 'fine', 'rent', 'insurance', 'other_expense'
);
CREATE TYPE job_type AS ENUM ('required', 'optional', 'custom');
CREATE TYPE credit_grade AS ENUM ('1', '2', '3', '4', '5');
CREATE TYPE rent_type AS ENUM ('jeonse', 'wolse');
CREATE TYPE savings_type AS ENUM ('simple', 'compound');
CREATE TYPE insurance_payment_type AS ENUM ('lump', 'monthly');

-- ============================================
-- 아바타 프리셋
-- ============================================

CREATE TABLE avatar_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('animal', 'character', 'job', 'color')),
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 사용자
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE,  -- Supabase Auth와 연동
  email TEXT,
  name TEXT NOT NULL,
  role user_role NOT NULL,
  pin TEXT,  -- 학생용 4~6자리 PIN (해싱 저장)
  avatar_preset_id UUID REFERENCES avatar_presets(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- 학급
-- ============================================

CREATE TABLE classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  school TEXT NOT NULL,
  grade INT NOT NULL CHECK (grade BETWEEN 1 AND 6),
  class_num INT NOT NULL CHECK (class_num >= 1),
  semester INT NOT NULL DEFAULT 1,
  teacher_id UUID NOT NULL REFERENCES users(id),
  currency_name TEXT NOT NULL DEFAULT '미소',
  currency_unit TEXT NOT NULL DEFAULT '미소',
  currency_ratio INT NOT NULL DEFAULT 10000,
  initial_balance INT NOT NULL DEFAULT 50,
  invite_code TEXT NOT NULL UNIQUE,
  economy_mode economy_mode NOT NULL DEFAULT 'semi',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  semester_start DATE,
  semester_end DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_classrooms_teacher ON classrooms(teacher_id);
CREATE UNIQUE INDEX idx_classrooms_invite ON classrooms(invite_code);

-- ============================================
-- 학급 멤버십
-- ============================================

CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  UNIQUE(user_id, classroom_id)
);

CREATE INDEX idx_memberships_classroom ON memberships(classroom_id);
CREATE INDEX idx_memberships_user ON memberships(user_id);

-- ============================================
-- 통장 (계좌)
-- ============================================

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  balance INT NOT NULL DEFAULT 0,
  credit_score INT NOT NULL DEFAULT 800,
  credit_grade credit_grade NOT NULL DEFAULT '2',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, classroom_id)
);

CREATE INDEX idx_accounts_classroom ON accounts(classroom_id);

-- ============================================
-- 거래 내역
-- ============================================

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  category transaction_category NOT NULL,
  amount INT NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  counterpart_id UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

-- ============================================
-- 직업
-- ============================================

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type job_type NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  salary INT NOT NULL DEFAULT 0,
  max_count INT NOT NULL DEFAULT 1,
  qualifications TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_jobs_classroom ON jobs(classroom_id);

-- ============================================
-- 직업 배정
-- ============================================

CREATE TABLE job_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  UNIQUE(job_id, user_id)
);

CREATE INDEX idx_job_assignments_user ON job_assignments(user_id);

-- ============================================
-- 자격증
-- ============================================

CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade TEXT,  -- 금/은/동 등
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 마트 (상점)
-- ============================================

CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'official' CHECK (type IN ('official', 'student')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 상품
-- ============================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price INT NOT NULL CHECK (price > 0),
  stock INT NOT NULL DEFAULT 0,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT '기타',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_store ON products(store_id);

-- ============================================
-- 부동산 (자리)
-- ============================================

CREATE TABLE seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  position_row INT NOT NULL,
  position_col INT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  owner_id UUID REFERENCES users(id),
  resident_id UUID REFERENCES users(id),
  price INT NOT NULL DEFAULT 0,
  rent_price INT NOT NULL DEFAULT 0,
  rent_type rent_type NOT NULL DEFAULT 'wolse',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(classroom_id, position_row, position_col)
);

-- ============================================
-- 주식
-- ============================================

CREATE TABLE stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  current_price INT NOT NULL DEFAULT 100,
  previous_price INT NOT NULL DEFAULT 100,
  description TEXT NOT NULL DEFAULT '',
  factor_type TEXT NOT NULL DEFAULT 'custom',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE stock_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  quantity INT NOT NULL CHECK (quantity > 0),
  price INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 보험
-- ============================================

CREATE TABLE insurances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  premium INT NOT NULL,
  payout INT NOT NULL,
  condition TEXT NOT NULL,
  payment_type insurance_payment_type NOT NULL DEFAULT 'monthly',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE insurance_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insurance_id UUID NOT NULL REFERENCES insurances(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'cancelled')),
  contracted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 저축 상품
-- ============================================

CREATE TABLE savings_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  interest_rate NUMERIC(5,2) NOT NULL,
  type savings_type NOT NULL DEFAULT 'simple',
  min_term_days INT NOT NULL DEFAULT 30,
  conditions TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE savings_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES savings_products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  principal INT NOT NULL CHECK (principal > 0),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  maturity_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'matured', 'withdrawn'))
);

-- ============================================
-- 벌금
-- ============================================

CREATE TABLE fines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  offender_id UUID NOT NULL REFERENCES users(id),
  reporter_id UUID NOT NULL REFERENCES users(id),
  reason TEXT NOT NULL,
  amount INT NOT NULL CHECK (amount > 0),
  approved_by UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fines_classroom ON fines(classroom_id);

-- ============================================
-- 알림
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),  -- NULL이면 전체 알림
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_classroom ON notifications(classroom_id);

-- ============================================
-- 물가 지수
-- ============================================

CREATE TABLE price_indices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  index_value NUMERIC(8,2) NOT NULL DEFAULT 100.00,
  adjusted_by TEXT,  -- 'auto' or 'manual'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 모듈 설정
-- ============================================

CREATE TABLE module_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  settings_json JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(classroom_id, module_name)
);

-- ============================================
-- 모듈 변경 로그
-- ============================================

CREATE TABLE module_change_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('on', 'off')),
  changed_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 경제 스냅샷 (외부 지표)
-- ============================================

CREATE TABLE economy_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator TEXT NOT NULL,  -- CPI, 금리, 코스피, 환율, 유가
  value NUMERIC(12,4) NOT NULL,
  source_url TEXT,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_economy_snapshots_indicator ON economy_snapshots(indicator, fetched_at DESC);

-- ============================================
-- 경제 이벤트
-- ============================================

CREATE TABLE economy_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('auto', 'scheduled', 'random')),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  effects_json JSONB NOT NULL DEFAULT '{}',
  trigger_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'executed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_economy_events_classroom ON economy_events(classroom_id);
