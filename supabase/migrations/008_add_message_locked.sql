-- rooms 테이블에 message_locked 컬럼 추가
-- 만든이가 메시지 작성/수정을 일시적으로 차단할 수 있는 잠금 기능.
-- 기본값 false (잠금 해제 상태).

ALTER TABLE rooms
  ADD COLUMN IF NOT EXISTS message_locked boolean DEFAULT false;
