-- 세금내는 아이들 추가 기능: RPC 함수, RLS 정책

-- ============================================
-- RPC: 잔액 업데이트 (원자적 처리)
-- ============================================

CREATE OR REPLACE FUNCTION update_balance(
  p_account_id UUID,
  p_amount NUMERIC
) RETURNS void AS $$
BEGIN
  UPDATE accounts
  SET balance = balance + p_amount
  WHERE id = p_account_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account not found: %', p_account_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RLS (Row Level Security) 활성화
-- ============================================

ALTER TABLE avatar_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurances ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_indices ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_change_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE economy_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE economy_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS 정책: 인증된 사용자 전체 접근 (MVP)
-- 추후 학급별 세분화 필요
-- ============================================

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'avatar_presets','users','classrooms','memberships','accounts',
      'transactions','jobs','job_assignments','certificates','stores',
      'products','seats','stocks','stock_transactions','insurances',
      'insurance_contracts','savings_products','savings_accounts',
      'fines','notifications','price_indices','module_configs',
      'module_change_logs','economy_snapshots','economy_events'
    ])
  LOOP
    EXECUTE format('CREATE POLICY "Allow authenticated select on %I" ON %I FOR SELECT TO authenticated USING (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow authenticated insert on %I" ON %I FOR INSERT TO authenticated WITH CHECK (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow authenticated update on %I" ON %I FOR UPDATE TO authenticated USING (true) WITH CHECK (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow authenticated delete on %I" ON %I FOR DELETE TO authenticated USING (true)', tbl, tbl);
  END LOOP;
END $$;
