-- ============================================================
-- 주최자 전용 RPC 함수
-- SECURITY DEFINER: RLS 우회하여 서버 권한으로 실행
-- ============================================================

-- wrap_room: 롤링페이퍼를 포장 완료 상태로 변경하고 open_key 반환
CREATE OR REPLACE FUNCTION wrap_room(p_slug TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_open_key TEXT;
BEGIN
  UPDATE rooms
  SET    status     = 'wrapped',
         wrapped_at = now()
  WHERE  slug   = p_slug
    AND  status  = 'collecting'
  RETURNING open_key INTO v_open_key;

  IF v_open_key IS NULL THEN
    RAISE EXCEPTION '이미 포장됐거나 존재하지 않는 롤링페이퍼예요.';
  END IF;

  RETURN v_open_key;
END;
$$;
