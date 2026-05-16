/**
 * PIUM 로고 SVG 컴포넌트
 * 원본: design/02. 한글 + 영어.html 에서 추출
 * - "피움" 텍스트: Gowun Dodum serif, 진한 그린 (#2d4a2d)
 * - "PIUM" 서브텍스트: Pretendard, 연한 그린 (#7a9676)
 * - 꽃 아이콘: 핑크 5-꽃잎 (#ff8aa0) + 노란 중심 (#ffd84a), "피" 위에 배치
 */
export default function PiumLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="PIUM 피움"
      role="img"
    >
      {/* 꽃 장식 — "피" 위쪽 */}
      <g transform="translate(100, 38)">
        {/* 5개 꽃잎 — 72° 간격 */}
        <ellipse cx="0"       cy="-11"   rx="6" ry="10" fill="#ff8aa0" transform="rotate(0 0 -11)"                                    />
        <ellipse cx="10.462"  cy="-3.399" rx="6" ry="10" fill="#ff8aa0" transform="rotate(72 10.462 -3.399)"                          />
        <ellipse cx="6.466"   cy="8.899"  rx="6" ry="10" fill="#ff8aa0" transform="rotate(144 6.466 8.899)"                           />
        <ellipse cx="-6.466"  cy="8.899"  rx="6" ry="10" fill="#ff8aa0" transform="rotate(216 -6.466 8.899)"                          />
        <ellipse cx="-10.462" cy="-3.399" rx="6" ry="10" fill="#ff8aa0" transform="rotate(288 -10.462 -3.399)"                        />
        {/* 노란 중심 */}
        <circle cx="0" cy="0" r="5" fill="#ffd84a" />
      </g>

      {/* 피움 한글 텍스트 */}
      <text
        x="40"
        y="140"
        fontFamily="'Gowun Dodum', 'Noto Serif KR', serif"
        fontSize="110"
        fontWeight="700"
        fill="#2d4a2d"
        style={{ letterSpacing: '6px' }}
      >
        피움
      </text>

      {/* PIUM 영문 서브텍스트 */}
      <text
        x="40"
        y="180"
        fontFamily="Pretendard, 'Apple SD Gothic Neo', sans-serif"
        fontSize="22"
        fontWeight="600"
        fill="#7a9676"
        style={{ letterSpacing: '8px' }}
      >
        PIUM
      </text>
    </svg>
  )
}
