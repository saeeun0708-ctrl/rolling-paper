-- ============================================================
-- messages SELECT 정책 수정
-- 이유: 작성자 본인 메시지 조회(수정/삭제/내글찾기)를 위해
--       visible 상태인 모든 메시지를 조회 가능하게 변경
-- (열람은 앱 단에서 wrapped 상태일 때만 보여주는 방식으로 제어)
-- ============================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "messages_select" ON messages;

-- 수정된 SELECT 정책 — visible 메시지 전체 조회 허용
CREATE POLICY "messages_select"
  ON messages FOR SELECT
  TO anon, authenticated
  USING (status = 'visible');

-- UPDATE/DELETE 정책도 재생성 (헤더 기반 → 앱 레이어 토큰 필터로 변경)
DROP POLICY IF EXISTS "messages_update_own" ON messages;
DROP POLICY IF EXISTS "messages_delete_own" ON messages;

-- 앱에서 .eq('author_token', token) 으로 필터링하므로 RLS는 허용
CREATE POLICY "messages_update_own"
  ON messages FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "messages_delete_own"
  ON messages FOR DELETE
  TO anon, authenticated
  USING (true);
