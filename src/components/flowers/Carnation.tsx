import type { FlowerProps } from './types'

/**
 * 카네이션 — 5개 타원 꽃잎이 방사형으로 겹쳐진 형태
 * 디자인 교체 시 이 파일의 SVG 내용만 변경하면 됩니다.
 */
export default function Carnation({
  size  = 48,
  color = '#f43f67',
  label = '카네이션',
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
      {/* 5개 꽃잎 — 중심(20,20) 기준 72° 간격 회전 */}
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <ellipse
          key={i}
          cx="20" cy="10"
          rx="5" ry="12"
          fill={color}
          opacity="0.82"
          transform={`rotate(${deg} 20 20)`}
        />
      ))}
      {/* 수술 중앙 */}
      <circle cx="20" cy="20" r="5.5" fill={color} />
      <circle cx="20" cy="20" r="3"   fill="white" opacity="0.35" />
    </svg>
  )
}
