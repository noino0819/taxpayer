-- 종목별 가격 변동 설정: 교사가 종목마다 조정 가능

ALTER TABLE stocks
  ADD COLUMN IF NOT EXISTS price_impact_rate NUMERIC(5,4) NOT NULL DEFAULT 0.015,
  ADD COLUMN IF NOT EXISTS max_price_impact  NUMERIC(5,4) NOT NULL DEFAULT 0.15;

COMMENT ON COLUMN stocks.price_impact_rate IS '주당 가격 영향률 (0.015 = 1.5%). 매수/매도 1주당 이 비율만큼 가격 변동';
COMMENT ON COLUMN stocks.max_price_impact  IS '한 거래당 최대 변동 상한 (0.15 = 15%). 한국 상한가(30%) 대비 보수적 기본값';
