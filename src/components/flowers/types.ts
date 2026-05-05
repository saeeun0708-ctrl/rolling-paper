/** 모든 꽃 컴포넌트가 공유하는 props 인터페이스 */
export interface FlowerProps {
  /** 꽃 크기 (px). 기본값 48 */
  size?: number
  /** 메인 fill 색상. 기본값은 꽃마다 다름 */
  color?: string
  /** 스크린 리더용 접근성 레이블 */
  label?: string
  /** 추가 className */
  className?: string
}
