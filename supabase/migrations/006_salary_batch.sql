-- 월급 자동 지급 배치 처리 함수
-- pg_cron 또는 Edge Function에서 매일 호출하여
-- 선생님 접속 없이도 지급일에 자동으로 월급 처리

CREATE OR REPLACE FUNCTION process_scheduled_salaries()
RETURNS jsonb AS $$
DECLARE
  classroom_rec RECORD;
  assignment_rec RECORD;
  today_kst DATE;
  today_dow INT;
  schedule_freq TEXT;
  schedule_dow INT;
  schedule_dom INT;
  last_paid TEXT;
  excluded_ids TEXT[];
  is_payday BOOLEAN;
  payday_str TEXT;
  account_id_val UUID;
  pay_count INT := 0;
  total_classrooms INT := 0;
BEGIN
  today_kst := (now() AT TIME ZONE 'Asia/Seoul')::date;
  today_dow := EXTRACT(ISODOW FROM today_kst)::int;
  payday_str := to_char(today_kst, 'YYYY-MM-DD');

  FOR classroom_rec IN
    SELECT mc.classroom_id, mc.settings_json
    FROM module_configs mc
    WHERE mc.module_name = 'job' AND mc.is_enabled = true
  LOOP
    schedule_freq := COALESCE(classroom_rec.settings_json->>'payFrequency', 'weekly');
    schedule_dow := COALESCE((classroom_rec.settings_json->>'payDayOfWeek')::int, 5);
    schedule_dom := COALESCE((classroom_rec.settings_json->>'payDayOfMonth')::int, 1);
    last_paid := classroom_rec.settings_json->>'lastPaidAt';

    is_payday := false;

    IF schedule_freq = 'monthly' THEN
      is_payday := EXTRACT(DAY FROM today_kst)::int = schedule_dom;
    ELSIF schedule_freq = 'weekly' THEN
      is_payday := today_dow = schedule_dow;
    ELSIF schedule_freq = 'biweekly' THEN
      IF today_dow = schedule_dow THEN
        is_payday := (EXTRACT(WEEK FROM today_kst)::int % 2) = 0;
      END IF;
    END IF;

    IF NOT is_payday THEN
      CONTINUE;
    END IF;

    IF last_paid IS NOT NULL AND last_paid >= payday_str THEN
      CONTINUE;
    END IF;

    SELECT ARRAY(
      SELECT jsonb_array_elements_text(
        COALESCE(classroom_rec.settings_json->'excludedUserIds', '[]'::jsonb)
      )
    ) INTO excluded_ids;

    FOR assignment_rec IN
      SELECT ja.user_id, j.salary, j.name AS job_name
      FROM job_assignments ja
      JOIN jobs j ON j.id = ja.job_id
      WHERE j.classroom_id = classroom_rec.classroom_id
        AND j.is_active = true
        AND ja.status = 'active'
        AND ja.user_id::text != ALL(COALESCE(excluded_ids, ARRAY[]::TEXT[]))
    LOOP
      SELECT id INTO account_id_val
      FROM accounts
      WHERE user_id = assignment_rec.user_id
        AND classroom_id = classroom_rec.classroom_id;

      IF account_id_val IS NULL THEN
        CONTINUE;
      END IF;

      INSERT INTO transactions (account_id, type, category, amount, description)
      VALUES (
        account_id_val, 'income', 'salary',
        assignment_rec.salary,
        assignment_rec.job_name || ' 월급'
      );

      UPDATE accounts
      SET balance = balance + assignment_rec.salary
      WHERE id = account_id_val;

      pay_count := pay_count + 1;
    END LOOP;

    UPDATE module_configs
    SET settings_json = settings_json || jsonb_build_object(
          'lastPaidAt', payday_str,
          'excludedUserIds', '[]'::jsonb
        ),
        updated_at = now()
    WHERE classroom_id = classroom_rec.classroom_id
      AND module_name = 'job';

    total_classrooms := total_classrooms + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'date', payday_str,
    'classrooms_processed', total_classrooms,
    'salaries_paid', pay_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
