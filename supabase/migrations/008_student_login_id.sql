-- 학생 로그인 아이디 추가
-- 기존: 이름 + 초대코드 + 비밀번호 → 이름 중복 시 식별 불가
-- 변경: 아이디 + 초대코드 + 비밀번호 → 학급 내 고유 식별자

ALTER TABLE users ADD COLUMN login_id TEXT;

CREATE INDEX idx_users_login_id ON users(login_id);
