-- ============================================================
-- delete_room: 롤링페이퍼(방) 삭제 RPC
-- SECURITY DEFINER: RLS 우회하여 서버 권한으로 실행
-- messages 테이블은 ON DELETE CASCADE로 자동 삭제됨
-- ============================================================

CREATE OR REPLACE FUNCTION delete_room(p_slug TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM rooms WHERE slug = p_slug;

  IF NOT FOUND THEN
    RAISE EXCEPTION '존재하지 않는 롤링페이퍼예요.';
  END IF;
END;
$$;
