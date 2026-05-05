import type { FlowerProps } from './types'

/**
 * 클로버 — 4방향 원형 잎
 * 디자인 교체 시 이 파일의 SVG 내용만 변경하면 됩니다.
 */
export default function Clover({
  size  = 48,
  color = '#22d3ee',
  label = '클로버',
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
      {/* 4개 잎 (상·우·하·좌) */}
      <circle cx="20" cy="13" r="7.5" fill={color} opacity="0.88" />
      <circle cx="27" cy="20" r="7.5" fill={color} opacity="0.88" />
      <circle cx="20" cy="27" r="7.5" fill={color} opacity="0.88" />
      <circle cx="13" cy="20" r="7.5" fill={color} opacity="0.88" />
      {/* 중심 */}
      <circle cx="20" cy="20" r="4"   fill={color} />
      <circle cx="20" cy="20" r="2"   fill="white" opacity="0.4" />
    </svg>
  )
}
