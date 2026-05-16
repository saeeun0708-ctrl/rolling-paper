/**
 * PIUM 로고 SVG 컴포넌트
 * 원본: design/01. 영어.html 에서 추출
 * - "PIUM" 텍스트: Pretendard ExtraBold(800), 진한 그린 그라디언트
 * - 꽃 아이콘: 핑크 8-꽃잎(#ff8aa0) + 노란 중심(#ffd84a), "U" 위에 배치
 */
export default function PiumLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 160"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="PIUM"
      role="img"
    >
      <defs>
        <linearGradient id="pium-logo-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="rgb(45,74,45)" />
          <stop offset="100%" stopColor="rgb(26,58,26)" />
        </linearGradient>
      </defs>

      {/* 꽃 장식 — U 위쪽 (translate(160, 38)) */}
      <g transform="translate(120, 38)">
        <ellipse cx="12"      cy="0"      rx="5" ry="9" fill="#ff8aa0" transform="rotate(90 12 0)"                                   />
        <ellipse cx="8.485"   cy="8.485"  rx="5" ry="9" fill="#ff8aa0" transform="rotate(135 8.485 8.485)"                           />
        <ellipse cx="0"       cy="12"     rx="5" ry="9" fill="#ff8aa0" transform="rotate(180 0 12)"                                   />
        <ellipse cx="-8.485"  cy="8.485"  rx="5" ry="9" fill="#ff8aa0" transform="rotate(225 -8.485 8.485)"                          />
        <ellipse cx="-12"     cy="0"      rx="5" ry="9" fill="#ff8aa0" transform="rotate(270 -12 0)"                                  />
        <ellipse cx="-8.485"  cy="-8.485" rx="5" ry="9" fill="#ff8aa0" transform="rotate(315 -8.485 -8.485)"                         />
        <ellipse cx="0"       cy="-12"    rx="5" ry="9" fill="#ff8aa0" transform="rotate(360 0 -12)"                                  />
        <ellipse cx="8.485"   cy="-8.485" rx="5" ry="9" fill="#ff8aa0" transform="rotate(405 8.485 -8.485)"                          />
        <circle  cx="0"       cy="0"      r="6"          fill="#ffd84a" />
      </g>

      {/* PIUM 텍스트 */}
      <text
        x="40"
        y="120"
        fontFamily="Pretendard, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif"
        fontSize="100"
        fontWeight="800"
        fill="url(#pium-logo-grad)"
        style={{ letterSpacing: '-2px' }}
      >
        PIUM
      </text>
    </svg>
  )
}
