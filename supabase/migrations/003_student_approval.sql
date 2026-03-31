-- 학생 가입 승인 워크플로
-- memberships.status에 'pending' 상태 추가

ALTER TABLE memberships
  DROP CONSTRAINT IF EXISTS memberships_status_check;

ALTER TABLE memberships
  ADD CONSTRAINT memberships_status_check
  CHECK (status IN ('active', 'inactive', 'pending'));

-- anon 사용자도 학생 가입(users + memberships insert)이 가능하도록 RLS 정책 추가
CREATE POLICY "Allow anon insert on users" ON users
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon select on classrooms" ON classrooms
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert on memberships" ON memberships
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon select on memberships" ON memberships
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon select on users" ON users
  FOR SELECT TO anon USING (true);
