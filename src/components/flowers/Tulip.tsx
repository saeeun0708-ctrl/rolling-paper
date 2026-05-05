import type { FlowerProps } from './types'

/**
 * 튤립 — 컵 모양 3개 꽃잎
 * 디자인 교체 시 이 파일의 SVG 내용만 변경하면 됩니다.
 */
export default function Tulip({
  size  = 48,
  color = '#c026d3',
  label = '튤립',
  className,
}: FlowerProps) {
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
      {/* 왼쪽 꽃잎 */}
      <path
        d="M20 29 Q7 22 9 9 Q14 17 20 21 Z"
        fill={color}
        opacity="0.82"
      />
      {/* 오른쪽 꽃잎 */}
      <path
        d="M20 29 Q33 22 31 9 Q26 17 20 21 Z"
        fill={color}
        opacity="0.82"
      />
      {/* 중앙(앞) 꽃잎 */}
      <path
        d="M20 28 Q13 14 20 5 Q27 14 20 28 Z"
        fill={color}
      />
      {/* 광택 하이라이트 */}
      <path
        d="M20 14 Q22 10 20 7 Q21 11 20 14 Z"
        fill="white"
        opacity="0.3"
      />
    </svg>
  )
}
