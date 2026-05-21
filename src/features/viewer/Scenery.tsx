// === 수채화 배경 풍경 SVG ===
// Claude Design에서 디자인된 봄날(spring) 1종.
// CLAUDE.md "풀숲 테마 1종만 구현한다" 규칙에 맞춰 sunset/morning 팔레트는 제거.

import { memo } from 'react'

// 호환을 위해 variant 타입은 유지하되 spring만 의미를 가진다.
export type SceneryVariant = 'spring'

interface SceneryProps {
  variant?: SceneryVariant
}

// 단일 봄 팔레트 — 모듈 스코프 상수
const SPRING_PALETTE = {
  sky: ['#fef6ea', '#e8f3e0', '#d8ecd0'],
  mtFar: '#b8d4c2',
  mtMid: '#8fbfa0',
  mtNear: '#6fae84',
  hill1:  '#9ed18e',
  hill2:  '#7cbd76',
  hill3:  '#5fa861',
  grass:  '#86c47e',
  mist:   'rgba(255,255,255,0.55)',
  sunCx: 78, sunCy: 18, sunR: 8, sunColor: '#fff5d4',
} as const

// 풀잎 디테일 path 데이터 — 한 번만 계산하고 모듈 스코프에 캐싱.
// H9: 매 렌더마다 Array.from으로 40개 path를 재계산하지 않도록.
const GRASS_BLADES = Array.from({ length: 40 }).map((_, i) => {
  const x = (i * 1600) / 40 + (i % 3) * 6
  const h = 6 + (i % 5) * 3
  const y = 750 + (i % 4) * 20
  return { key: i, d: `M${x} ${y} q 2 -${h} 0 -${h * 1.6}` }
})

// SVG 컨테이너용 정적 스타일 — 매 렌더 새 객체 생성 방지
const SVG_STYLE: React.CSSProperties = {
  position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block',
}
const PAPER_OVERLAY_STYLE: React.CSSProperties = { mixBlendMode: 'multiply' as const }

function SceneryImpl(_props: SceneryProps) {
  const p = SPRING_PALETTE

  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      style={SVG_STYLE}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={p.sky[0]}/>
          <stop offset="55%"  stopColor={p.sky[1]}/>
          <stop offset="100%" stopColor={p.sky[2]}/>
        </linearGradient>
        <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={p.sunColor} stopOpacity="1"/>
          <stop offset="60%"  stopColor={p.sunColor} stopOpacity="0.4"/>
          <stop offset="100%" stopColor={p.sunColor} stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="mt-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={p.mtFar} stopOpacity="0.7"/>
          <stop offset="100%" stopColor={p.mtFar} stopOpacity="0.95"/>
        </linearGradient>
        <linearGradient id="mt-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={p.mtMid} stopOpacity="0.85"/>
          <stop offset="100%" stopColor={p.mtMid}/>
        </linearGradient>
        <linearGradient id="hill-1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={p.hill1}/>
          <stop offset="100%" stopColor={p.hill2}/>
        </linearGradient>
        <linearGradient id="hill-2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={p.hill2}/>
          <stop offset="100%" stopColor={p.hill3}/>
        </linearGradient>
        <linearGradient id="grass-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={p.grass}/>
          <stop offset="100%" stopColor={p.hill3}/>
        </linearGradient>
        {/* 수채화 종이 텍스처 */}
        <filter id="paper" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="5"/>
          <feColorMatrix values="0 0 0 0 0.6  0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0.05 0"/>
        </filter>
      </defs>

      {/* 하늘 */}
      <rect width="1600" height="900" fill="url(#sky-grad)"/>

      {/* 해 */}
      <circle cx={p.sunCx * 16} cy={p.sunCy * 9} r={p.sunR * 8} fill="url(#sun-glow)"/>
      <circle cx={p.sunCx * 16} cy={p.sunCy * 9} r={p.sunR * 2} fill={p.sunColor} opacity="0.85"/>

      {/* 구름 */}
      <g opacity="0.55" fill="#ffffff">
        <ellipse cx="280"  cy="140" rx="120" ry="22"/>
        <ellipse cx="320"  cy="155" rx="80"  ry="14"/>
        <ellipse cx="1100" cy="100" rx="140" ry="18"/>
        <ellipse cx="1150" cy="115" rx="90"  ry="12"/>
      </g>

      {/* 먼 산 3겹 */}
      <path d="M0 460 Q120 380 240 410 Q380 360 520 405 Q680 365 820 410 Q970 375 1120 410 Q1280 380 1420 410 Q1520 400 1600 420 L1600 600 L0 600 Z"
        fill="url(#mt-far)" opacity="0.7"/>
      <path d="M0 510 Q140 440 280 480 Q440 430 600 480 Q760 440 920 485 Q1080 450 1240 480 Q1400 450 1600 490 L1600 620 L0 620 Z"
        fill="url(#mt-mid)" opacity="0.85"/>
      <path d="M0 560 Q160 500 320 540 Q500 490 680 540 Q860 510 1040 545 Q1220 510 1400 545 Q1500 535 1600 555 L1600 660 L0 660 Z"
        fill={p.mtNear}/>

      {/* 중간 언덕 */}
      <path d="M0 620 Q200 580 400 610 Q600 575 800 605 Q1000 580 1200 605 Q1400 585 1600 615 L1600 760 L0 760 Z"
        fill="url(#hill-1)"/>
      <path d="M0 680 Q220 640 440 670 Q660 640 880 670 Q1100 645 1320 670 Q1500 660 1600 680 L1600 820 L0 820 Z"
        fill="url(#hill-2)" opacity="0.95"/>

      {/* 안개/미스트 띠 */}
      <rect x="0" y="540" width="1600" height="60" fill={p.mist} opacity="0.6"/>
      <rect x="0" y="610" width="1600" height="40" fill={p.mist} opacity="0.4"/>

      {/* 풀밭 */}
      <path d="M0 720 Q200 690 400 715 Q600 690 800 715 Q1000 690 1200 715 Q1400 695 1600 720 L1600 900 L0 900 Z"
        fill="url(#grass-grad)"/>

      {/* 풀잎 디테일 — 미리 계산된 path 사용 */}
      <g opacity="0.55" stroke={p.hill3} strokeWidth="1.4" fill="none" strokeLinecap="round">
        {GRASS_BLADES.map(b => <path key={b.key} d={b.d}/>)}
      </g>

      {/* 종이 노이즈 오버레이 — opacity 낮춰 침침함 완화 */}
      <rect width="1600" height="900" fill="url(#paper)" opacity="0.06"
        style={PAPER_OVERLAY_STYLE}/>
    </svg>
  )
}

// H9: React.memo로 prop이 변하지 않으면 리렌더 차단.
// 부모(MeadowView) 호버 인터랙션 시 Scenery는 재렌더할 이유가 없다.
const Scenery = memo(SceneryImpl)

export default Scenery
