-- 004_auto_delete_cron.sql
-- 만료된 롤링페이퍼 자동 삭제 cron 설정
-- Supabase Dashboard > SQL Editor에서 직접 실행하세요.
-- (pg_cron은 Supabase 프로젝트 설정에서 활성화 필요)

-- ── 1. pg_cron 확장 활성화 ──────────────────────────────────────────────────
-- Supabase Dashboard > Database > Extensions 에서 pg_cron 활성화 후 실행
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ── 2. 만료 rooms 삭제 함수 ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION delete_expired_rooms()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 만료된 rooms 삭제 (CASCADE로 연결된 messages도 함께 삭제됨)
  DELETE FROM public.rooms
  WHERE expires_at < now();
END;
$$;

-- ── 3. cron 스케줄 등록 (매일 새벽 3시 KST = UTC 18:00 전날) ──────────────
SELECT cron.schedule(
  'delete-expired-rooms',   -- 작업 이름 (고유)
  '0 18 * * *',             -- UTC 18:00 = KST 03:00 (다음날)
  'SELECT delete_expired_rooms()'
);

-- ── 확인 쿼리 ──────────────────────────────────────────────────────────────
-- SELECT * FROM cron.job;
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- ── 스케줄 삭제 방법 (필요 시) ────────────────────────────────────────────
-- SELECT cron.unschedule('delete-expired-rooms');
