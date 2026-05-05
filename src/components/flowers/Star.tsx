import type { FlowerProps } from './types'

/**
 * 별 — 5각 별 모양
 * 디자인 교체 시 이 파일의 SVG 내용만 변경하면 됩니다.
 */
export default function Star({
  size  = 48,
  color = '#f59e0b',
  label = '별',
  className,
}: FlowerProps) {
  // 5각 별 꼭짓점 (외부 r=17, 내부 r=7, 중심 20,20)
  const pts = '20,3 24.1,14.3 36.2,14.7 26.7,22.2 30,33.7 20,27 10,33.7 13.3,22.2 3.8,14.7 15.9,14.3'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label={label}
      className={className}
    >
      <title>{label}</title>
      {/* 그림자 레이어 */}
      <polygon points={pts} fill={color} opacity="0.25" transform="translate(1 2)" />
      {/* 메인 별 */}
      <polygon points={pts} fill={color} />
      {/* 하이라이트 */}
      <polygon points={pts} fill="white" opacity="0.2" transform="scale(0.55) translate(18 18)" />
    </svg>
  )
}
