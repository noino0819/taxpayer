-- 주식 시스템 개선: 가격 변동 이력, 이벤트 기반 주가 변동

-- ============================================
-- 주식 가격 이력 테이블
-- ============================================

CREATE TABLE stock_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  price INT NOT NULL,
  previous_price INT NOT NULL,
  change_reason TEXT NOT NULL DEFAULT 'manual',
  event_id UUID REFERENCES economy_events(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stock_price_history_stock ON stock_price_history(stock_id, created_at DESC);

-- ============================================
-- economy_events 테이블에 executed_at 컬럼 추가
-- ============================================

ALTER TABLE economy_events ADD COLUMN IF NOT EXISTS executed_at TIMESTAMPTZ;

-- ============================================
-- RLS 활성화 + 정책
-- ============================================

ALTER TABLE stock_price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated select on stock_price_history"
  ON stock_price_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on stock_price_history"
  ON stock_price_history FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on stock_price_history"
  ON stock_price_history FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete on stock_price_history"
  ON stock_price_history FOR DELETE TO authenticated USING (true);

-- ============================================
-- RPC: 단일 종목 가격 갱신 (수동 조정)
-- ============================================

CREATE OR REPLACE FUNCTION update_stock_price(
  p_stock_id UUID,
  p_new_price INT,
  p_reason TEXT DEFAULT 'manual'
) RETURNS void AS $$
DECLARE
  v_old_price INT;
BEGIN
  SELECT current_price INTO v_old_price FROM stocks WHERE id = p_stock_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stock not found: %', p_stock_id;
  END IF;

  UPDATE stocks
  SET previous_price = current_price,
      current_price = p_new_price
  WHERE id = p_stock_id;

  INSERT INTO stock_price_history (stock_id, price, previous_price, change_reason)
  VALUES (p_stock_id, p_new_price, v_old_price, p_reason);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RPC: 학급 전체 종목 랜덤 변동 적용
-- ============================================

CREATE OR REPLACE FUNCTION apply_random_fluctuation(
  p_classroom_id UUID,
  p_min_pct NUMERIC DEFAULT -10,
  p_max_pct NUMERIC DEFAULT 10,
  p_min_price INT DEFAULT 10
) RETURNS void AS $$
DECLARE
  rec RECORD;
  v_pct NUMERIC;
  v_new_price INT;
BEGIN
  FOR rec IN
    SELECT id, current_price FROM stocks
    WHERE classroom_id = p_classroom_id AND is_active = true
  LOOP
    v_pct := p_min_pct + random() * (p_max_pct - p_min_pct);
    v_new_price := GREATEST(p_min_price, ROUND(rec.current_price * (1 + v_pct / 100.0)));

    UPDATE stocks
    SET previous_price = current_price,
        current_price = v_new_price
    WHERE id = rec.id;

    INSERT INTO stock_price_history (stock_id, price, previous_price, change_reason)
    VALUES (rec.id, v_new_price, rec.current_price, 'random');
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RPC: 이벤트 효과 적용
-- effects_json 형식: { "stocks": { "<factor_type>": <percent_change> } }
-- 예: { "stocks": { "attendance": 15, "cleanliness": -10 } }
-- ============================================

CREATE OR REPLACE FUNCTION apply_stock_event(
  p_event_id UUID,
  p_min_price INT DEFAULT 10
) RETURNS void AS $$
DECLARE
  v_event RECORD;
  v_effects JSONB;
  v_factor TEXT;
  v_pct NUMERIC;
  rec RECORD;
  v_new_price INT;
BEGIN
  SELECT * INTO v_event FROM economy_events WHERE id = p_event_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found: %', p_event_id;
  END IF;

  v_effects := v_event.effects_json -> 'stocks';
  IF v_effects IS NULL THEN
    RAISE EXCEPTION 'Event has no stock effects';
  END IF;

  FOR v_factor, v_pct IN
    SELECT key, value::numeric FROM jsonb_each_text(v_effects)
  LOOP
    FOR rec IN
      SELECT id, current_price FROM stocks
      WHERE classroom_id = v_event.classroom_id
        AND factor_type = v_factor
        AND is_active = true
    LOOP
      v_new_price := GREATEST(p_min_price, ROUND(rec.current_price * (1 + v_pct / 100.0)));

      UPDATE stocks
      SET previous_price = current_price,
          current_price = v_new_price
      WHERE id = rec.id;

      INSERT INTO stock_price_history (stock_id, price, previous_price, change_reason, event_id)
      VALUES (rec.id, v_new_price, rec.current_price, 'event', p_event_id);
    END LOOP;
  END LOOP;

  UPDATE economy_events
  SET status = 'executed', executed_at = now()
  WHERE id = p_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
