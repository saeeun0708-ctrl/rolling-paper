-- messages.shape CHECK 제약에 'sunflower' 추가
-- 코드의 FLOWER_SHAPES는 'sunflower'를 포함하지만 초기 마이그레이션(001_init.sql)의
-- CHECK 제약이 'star'만 허용하고 있어, 해바라기 선택 시 insert가 실패한다.
-- 'star'와 'cherry'는 구버전 데이터 호환 목적으로 함께 허용 목록에 유지.

ALTER TABLE messages
  DROP CONSTRAINT IF EXISTS messages_shape_check;

ALTER TABLE messages
  ADD CONSTRAINT messages_shape_check
  CHECK (shape IN ('carnation', 'daisy', 'tulip', 'clover', 'sunflower', 'star', 'cherry'));
