-- ============================================================
-- 메시지 조회 성능 인덱스 (H6)
-- room_id로 필터 + created_at 정렬을 함께 다루는 복합 인덱스.
-- HostPage / ViewerPage / ListMode 모두 동일한 쿼리 패턴을 쓰므로
-- (room_id, created_at DESC) 복합 인덱스가 가장 큰 효과를 낸다.
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_messages_room_created
  ON messages(room_id, created_at DESC);
