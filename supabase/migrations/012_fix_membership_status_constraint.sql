-- memberships.status CHECK 제약 조건 정비
-- migration 001에서 인라인 CHECK로 정의된 제약 조건이
-- migration 003의 DROP에서 이름 불일치로 삭제되지 않았을 가능성 수정

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE rel.relname = 'memberships'
      AND nsp.nspname = 'public'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) LIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE memberships DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE memberships
  ADD CONSTRAINT memberships_status_check
  CHECK (status IN ('active', 'inactive', 'pending'));
