-- unwrap_room: 포장 상태를 취소하고 다시 메시지를 수집할 수 있도록 롤백
-- SECURITY DEFINER: wrap_room과 동일하게 RLS 우회
CREATE OR REPLACE FUNCTION unwrap_room(p_slug TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE rooms
  SET    status     = 'collecting',
         wrapped_at = NULL
  WHERE  slug   = p_slug
    AND  status  = 'wrapped';
END;
$$;
