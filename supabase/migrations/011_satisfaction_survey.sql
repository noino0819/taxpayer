-- 만족도 설문 시스템

-- 설문 입력 모드
create type satisfaction_input_mode as enum ('student', 'teacher', 'both');

-- 설문 라운드 테이블
create table satisfaction_surveys (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references classrooms(id) on delete cascade,
  title text not null,
  description text not null default '',
  factor_type text not null,
  input_mode satisfaction_input_mode not null default 'both',
  auto_apply boolean not null default false,
  status text not null default 'open' check (status in ('open', 'closed')),
  teacher_rating integer check (teacher_rating between 1 and 5),
  avg_rating numeric(3, 2),
  applied_event_id uuid references economy_events(id),
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

create index idx_satisfaction_surveys_classroom on satisfaction_surveys(classroom_id);
create index idx_satisfaction_surveys_status on satisfaction_surveys(classroom_id, status);

-- 학생 개별 응답 테이블
create table satisfaction_responses (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references satisfaction_surveys(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  unique (survey_id, user_id)
);

create index idx_satisfaction_responses_survey on satisfaction_responses(survey_id);

-- RLS
alter table satisfaction_surveys enable row level security;
alter table satisfaction_responses enable row level security;

create policy "satisfaction_surveys_all" on satisfaction_surveys for all using (true) with check (true);
create policy "satisfaction_responses_all" on satisfaction_responses for all using (true) with check (true);
