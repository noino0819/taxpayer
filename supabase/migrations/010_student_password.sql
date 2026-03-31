-- 학생 인증 방식 개선: PIN(숫자) → 비밀번호(자유 조합)
-- 선생님 비밀번호 초기화 기능 지원

ALTER TABLE users RENAME COLUMN pin TO password;

ALTER TABLE users ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT false;
