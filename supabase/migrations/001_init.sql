-- ============================================================
-- 롤링페이퍼 서비스 초기 스키마 + RLS 설정
-- Supabase Dashboard > SQL Editor 에 전체 내용을 붙여넣고 Run 하세요.
-- ============================================================

-- uuid_generate_v4() 확장 활성화 (이미 활성화되어 있으면 무시됨)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. rooms 테이블 — 롤링페이퍼 방 정보
-- ============================================================
CREATE TABLE IF NOT EXISTS rooms (
  id             uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug           text        UNIQUE NOT NULL,          -- 작성용 URL 식별자
  open_key       text        NOT NULL,                 -- 열람용 별도 키 (포장 후 사용)
  recipient_name text        NOT NULL,                 -- 받는 분 이름
  theme          text        NOT NULL DEFAULT 'meadow',-- 테마 (현재 meadow 1종)
  host_name      text        NOT NULL,                 -- 방 개설자 이름
  host_pin_hash  text        NOT NULL,                 -- 개설자 PIN bcrypt 해시
  status         text        NOT NULL DEFAULT 'collecting' CHECK (status IN ('collecting', 'wrapped')),
  created_at     timestamptz NOT NULL DEFAULT now(),
  wrapped_at     timestamptz,                          -- 포장 완료 시각
  expires_at     timestamptz NOT NULL DEFAULT now() + interval '90 days'
);

-- ============================================================
-- 2. messages 테이블 — 각 방에 달린 메시지 카드
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id             uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id        uuid        NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  author_name    text        NOT NULL,                 -- 작성자 표시 이름
  author_token   text        NOT NULL,                 -- localStorage 랜덤 토큰 (본인 인증용)
  author_pin_hash text,                                -- 선택적 수정 PIN 해시
  body           text        NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  shape          text        NOT NULL CHECK (shape IN ('carnation', 'daisy', 'tulip', 'clover', 'star')),
  status         text        NOT NULL DEFAULT 'visible' CHECK (status IN ('visible', 'deleted')),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- updated_at 자동 갱신 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 3. 인덱스
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_rooms_slug      ON rooms(slug);
CREATE INDEX IF NOT EXISTS idx_messages_room   ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_token  ON messages(author_token);

-- ============================================================
-- 4. RLS(Row Level Security) 활성화
-- ============================================================
ALTER TABLE rooms    ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. rooms RLS 정책
-- ============================================================

-- 누구나 새 방을 만들 수 있다 (방 개설)
CREATE POLICY "rooms_insert_anyone"
  ON rooms FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 누구나 slug 또는 id 로 방 정보를 조회할 수 있다
CREATE POLICY "rooms_select_anyone"
  ON rooms FOR SELECT
  TO anon, authenticated
  USING (true);

-- 방 UPDATE는 앱 서버(service_role)만 허용 — 클라이언트 직접 수정 불가
-- (status 변경 등은 Edge Function 또는 서버사이드에서 수행)
CREATE POLICY "rooms_update_service_only"
  ON rooms FOR UPDATE
  TO authenticated
  USING (false);

-- ============================================================
-- 6. messages RLS 정책
-- ============================================================

-- 누구나 메시지를 작성할 수 있다
CREATE POLICY "messages_insert_anyone"
  ON messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 방이 'collecting' 상태일 때: 작성자 본인(author_token 일치)만 본인 메시지 조회 가능
-- 방이 'wrapped' 상태일 때: 해당 방의 모든 visible 메시지 조회 가능
CREATE POLICY "messages_select"
  ON messages FOR SELECT
  TO anon, authenticated
  USING (
    -- 포장 완료된 방의 메시지는 누구나 볼 수 있음 (열람 키 검증은 앱 단에서)
    (SELECT status FROM rooms WHERE id = messages.room_id) = 'wrapped'
    AND messages.status = 'visible'
  );

-- 작성자 본인(author_token 일치)만 메시지를 수정/삭제할 수 있다
CREATE POLICY "messages_update_own"
  ON messages FOR UPDATE
  TO anon, authenticated
  USING (author_token = current_setting('request.headers', true)::json->>'x-author-token')
  WITH CHECK (author_token = current_setting('request.headers', true)::json->>'x-author-token');

CREATE POLICY "messages_delete_own"
  ON messages FOR DELETE
  TO anon, authenticated
  USING (author_token = current_setting('request.headers', true)::json->>'x-author-token');
