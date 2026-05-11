-- ============================================================
-- rooms 테이블에 host_email 컬럼 추가
-- 목적: 같은 만든이가 기기를 바꿔도 본인이 만든 방 목록을 찾을 수 있도록 한다.
--      이메일은 단순 "복구 키" 역할이며, 실제 방 입장은 기존 PIN으로 인증한다.
-- 적용 방법: Supabase Dashboard > SQL Editor에서 아래 내용을 그대로 붙여넣고 Run.
-- ============================================================

-- 1. host_email 컬럼 추가 (nullable — 기존 방은 영향 없음)
ALTER TABLE rooms
  ADD COLUMN IF NOT EXISTS host_email text;

-- 2. 이메일로 방 목록을 조회하기 위한 인덱스
--    (이미 lowercase로 정규화해서 저장하므로 일반 B-tree 인덱스로 충분)
CREATE INDEX IF NOT EXISTS idx_rooms_host_email ON rooms(host_email);

-- 참고
-- ─ host_email은 NULL 허용. 만든이가 이메일 입력을 건너뛴 경우.
-- ─ 기존 rooms_select_anyone RLS 정책이 SELECT를 허용하므로
--   클라이언트에서 직접 host_email로 방 목록을 조회할 수 있다.
-- ─ 방 만들기 시점에 useCreateRoom에서 lowercase + trim 후 저장한다.
