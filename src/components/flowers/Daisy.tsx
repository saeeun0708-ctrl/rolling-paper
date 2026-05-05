import type { FlowerProps } from './types'

/**
 * 데이지 — 흰 꽃잎 8개 + 노란 수술
 * 디자인 교체 시 이 파일의 SVG 내용만 변경하면 됩니다.
 */
export default function Daisy({
  size  = 48,
  color = '#fbbf24',
  label = '데이지',
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
      {/* 흰 꽃잎 8개 */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
        <ellipse
          key={i}
          cx="20" cy="9"
          rx="3" ry="9"
          fill="white"
          opacity="0.93"
          transform={`rotate(${deg} 20 20)`}
        />
      ))}
      {/* 노란 수술 */}
      <circle cx="20" cy="20" r="7.5" fill={color} />
      <circle cx="20" cy="20" r="5"   fill="#f59e0b" />
      <circle cx="20" cy="20" r="2.5" fill={color} opacity="0.6" />
    </svg>
  )
}
