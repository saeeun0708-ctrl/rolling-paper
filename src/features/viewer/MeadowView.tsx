import { forwardRef, memo, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { type FlowerShape } from '../message-write/utils'
import Scenery from './Scenery'
import { FLOWER_SVG_COMPONENTS, type FlowerSvgShape } from './FlowerSvg'
import { honorificSuffix } from '../../lib/honorific'

interface Message { id: string; author_name: string; shape: string; body: string; created_at: string }
interface Props {
  messages:        Message[]
  recipientName:   string
  onFlowerClick:   (index: number) => void
  onListMode:      () => void
  /** 참여자 전용 — 메시지 작성 페이지로 이동 콜백. 있으면 연필 FAB 노출 */
  onWriteMessage?: () => void
}

// ── 꽃 shape → SVG 컴포넌트 매핑 (없으면 daisy 폴백) ──────────────────────
// 모듈 스코프 상수 — 매 렌더마다 새 객체가 만들어지지 않도록.
const SHAPE_MAP: Record<string, FlowerSvgShape> = {
  carnation:  'carnation',
  daisy:      'daisy',
  tulip:      'tulip',
  clover:     'clover',
  sunflower:  'sunflower',
  // 구버전 데이터 호환
  star:       'star',
  cherry:     'cherry',
}

// ── 꽃 종류별 시각 크기 보정 ──────────────────────────────────────────────
// 모든 SVG가 같은 viewBox(0 0 100 100)을 쓰지만, 내부 도형이 viewBox를 채우는 비율이
// 달라서 같은 size여도 시각적으로 크기 편차가 생긴다. (예: 튤립은 꽃 본체 폭이 ~32라
// 작아 보이고, 카네이션·클로버는 ~56이라 크게 보임.) 보정 계수로 균형을 맞춘다.
const SHAPE_SIZE_FACTOR: Record<FlowerSvgShape, number> = {
  carnation: 0.95,  // 벚꽃 — 5장 꽃잎이 viewBox를 균등하게 채워 자연스러운 크기
  daisy:     1.00,  // 10장 꽃잎이 r=22까지 뻗어 viewBox를 잘 채움 → 표준 크기로
  tulip:     0.98,  // 튤립 — 컵 형태
  clover:    1.00,
  sunflower: 0.82,  // 새 디자인이 viewBox를 거의 가득 채워(꽃잎 끝 y=8) 다른 꽃보다 크게 보이므로 보정
  star:      1.00,
  cherry:    1.00,
}

// ── 원근감 있는 꽃 배치 (Y 아래쪽이 더 크고 앞) ──────────────────────────
// H1: originalIndex를 함께 저장해 onFlowerClick에서 messages.findIndex를 제거.
interface PlacedFlower extends Message {
  x: number; y: number; size: number; depth: number; sway: number; originalIndex: number
}

function distributeFlowers(messages: Message[], seed = 7): PlacedFlower[] {
  const n = messages.length
  if (n === 0) return []
  const cols = Math.max(4, Math.ceil(Math.sqrt(n) * 1.6))
  const rows  = Math.ceil(n / cols)
  // 좌측 FAB(⚙️·☰)으로 인해 꽃이 시각적으로 우측 치우쳐 보이는 것을 보정:
  // 왼쪽 마진을 줄이고 오른쪽 마진을 늘려 분포 중심을 좌로 이동
  const yMax = 85
  // 메시지 수에 따라 풀숲 시작 위치(yMin)를 동적으로 조정.
  // - 1~5명(소수 가족): yMin을 위로 끌어올려 꽃이 화면 중앙에 위치 → 휑한 느낌 완화
  // - 6~35명: 기본 60% (화면 하단 25% 영역)
  // - 36명 이상: 1명당 0.67%씩 위로 확장하되 50%에서 멈춤 (그 이상은 풀밭 배경 이탈)
  const yMin = n <= 5
    ? 60 - (6 - n) * 4              // 1명=40, 2명=44, 3명=48, 4명=52, 5명=56
    : Math.max(50, 60 - Math.max(0, n - 35) * 0.67)
  const xLeft  = 7    // 왼쪽 마진(%) — FAB 보정으로 좌측 여유 줄임
  const xRight = 13   // 오른쪽 마진(%)
  const xRange = 100 - xLeft - xRight

  let s = seed * 9301 + 49297
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }

  // 마지막 행 꽃 수 (나머지가 0이면 cols 전체가 채워진 것)
  const lastRowCount = n % cols === 0 ? cols : n % cols

  const placed: PlacedFlower[] = []
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / cols)
    const c = i % cols
    const cellW = xRange / cols
    const cellH = (yMax - yMin) / Math.max(1, rows)
    // x 지터 제거 — 의사난수 편향으로 좌우 비대칭이 생기므로 열 위치를 수학적으로 고정
    const yJitter = (rand() - 0.5) * cellH * 0.7
    // 마지막 행은 중앙 정렬
    const colOffset = r === rows - 1 ? (cols - lastRowCount) / 2 : 0
    const x = xLeft + (c + colOffset) * cellW + cellW / 2
    const y = yMin + r * cellH + cellH / 2 + yJitter
    const depth = (y - yMin) / (yMax - yMin)
    // 메시지 수에 따라 자동 크기 조절: 적을수록 크게, 많을수록 작게 (원근감 없이 균일)
    const baseSize = Math.max(44, 110 - n * 3.5)
    const rawSize  = baseSize * (0.85 + depth * 0.25)
    // 꽃 종류별 시각 크기 편차를 보정
    const shapeKey = (SHAPE_MAP[messages[i].shape as FlowerShape] ?? 'daisy') as FlowerSvgShape
    const size     = rawSize * (SHAPE_SIZE_FACTOR[shapeKey] ?? 1.0)
    placed.push({ ...messages[i], x, y, size, depth, sway: rand() * 6 - 3, originalIndex: i })
  }
  return placed.sort((a, b) => a.depth - b.depth)
}

// ── 카운트 배지의 인라인 스타일도 상수화 ──────────────────────────────────
// 배지는 헤더(제목·부제) 아래에 위치 — 긴 수신자 이름과 시각적으로 겹치지 않도록.
const COUNT_BADGE_STYLE: React.CSSProperties = {
  position: 'absolute', top: 28, right: 20, zIndex: 10,
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '7px 14px 7px 10px',
  background: '#fffdf8',
  borderRadius: 999,
  boxShadow: '0 6px 18px rgba(40,60,40,0.12), inset 0 0 0 1px rgba(194,90,126,0.15)',
}

// ── 꽃 개수 배지 ──────────────────────────────────────────────────────────
function CountBadge({ count }: { count: number }) {
  return (
    <div style={COUNT_BADGE_STYLE}>
      {/* 작은 꽃 아이콘 */}
      <svg width="22" height="22" viewBox="0 0 100 100" aria-hidden>
        {[0, 72, 144, 216, 288].map((deg) => (
          <ellipse key={deg} cx="50" cy="30" rx="11" ry="18"
            fill="#ffc8d8" stroke="#c25a7e" strokeWidth="3"
            transform={`rotate(${deg} 50 50)`}/>
        ))}
        <circle cx="50" cy="50" r="7" fill="#ffd84a" stroke="#c25a7e" strokeWidth="3"/>
      </svg>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, lineHeight: 1 }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: '#c25a7e' }}>{count}</span>
        <span style={{ fontSize: 12, color: '#5a7a5a' }}>송이 꽃이 피었어요</span>
      </div>
    </div>
  )
}

// ── 꽃 한 송이 — 별도 컴포넌트로 분리해 hover를 자식 내부 state로 격리 ──
// H1 핵심: 부모(MeadowView)의 hoveredId를 상태로 들고 있으면 호버 시마다
// 전체 꽃 리스트가 리렌더된다. 각 셀이 자신의 hover 상태만 가지면
// 호버 인터랙션이 다른 셀의 렌더에 영향을 주지 않음.
interface FlowerCellProps {
  flower:        PlacedFlower
  animDelayIdx:  number
  onClick:       (originalIndex: number) => void
}

const FlowerCell = memo(function FlowerCell({ flower: f, animDelayIdx, onClick }: FlowerCellProps) {
  const [isHover, setIsHover] = useState(false)
  const svgKey  = SHAPE_MAP[f.shape as FlowerShape] ?? 'daisy'
  const FlowerComp = FLOWER_SVG_COMPONENTS[svgKey]

  const dropShadow = isHover
    ? `drop-shadow(0 6px 14px rgba(194,90,126,0.45))`
    : `drop-shadow(0 3px 5px rgba(0,0,0,0.18))`

  // 등장 애니메이션 파라미터 — 풀숲에 봉오리가 천천히 피어나는 느낌.
  // 기존 spring(stiffness 200)은 한꺼번에 튕겨 부자연스러웠고,
  // delay가 (idx % 20)이라 20송이마다 동시에 시작해 우르르 올라왔다.
  // easeOutExpo tween + 더 긴 stagger로 부드럽게 분산한다.
  const appearDelay = 0.15 + (animDelayIdx % 30) * 0.06
  const APPEAR_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

  // 살랑임 — 꽃마다 duration/delay를 살짝 다르게 줘서 동기화된 느낌을 깨뜨린다.
  // f.sway 값(-3~3) 기반으로 phase를 어긋나게.
  const swayDuration = 3.4 + Math.abs(f.sway) * 0.28           // 3.4~4.24s
  const swayDelay    = -(Math.abs(f.sway) * 0.7 + animDelayIdx * 0.05) // 음수 delay로 시작 시점 분산

  return (
    <motion.button
      onClick={() => onClick(f.originalIndex)}
      onHoverStart={() => setIsHover(true)}
      onHoverEnd={() => setIsHover(false)}
      initial={{ scale: 0.55, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ delay: appearDelay, duration: 0.9, ease: APPEAR_EASE }}
      style={{
        position: 'absolute',
        left: `${f.x}%`,
        top:  `${f.y}%`,
        transform: `translate(-50%, -85%) scale(${isHover ? 1.15 : 1})`,
        transition: 'transform 220ms cubic-bezier(.2,.8,.2,1)',
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        transformOrigin: '50% 95%',
        filter: dropShadow,
        zIndex: Math.floor(f.depth * 100) + 5,
      }}
      aria-label={`${f.author_name}님의 메시지 보기`}
    >
      {/* 살랑임 wrapper — motion.button의 transform과 분리해 충돌 방지 */}
      <span
        className="flower-sway"
        style={{
          animationDuration: `${swayDuration}s`,
          animationDelay:    `${swayDelay}s`,
        }}
      >
        <FlowerComp size={f.size}/>
      </span>

      {/* 이름 레이블 */}
      <div style={{
        position: 'absolute', left: '50%', bottom: -2,
        transform: 'translateX(-50%)',
        fontSize: Math.max(8, f.size * 0.15),
        color: '#2d4a2d',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        background: 'rgba(255,255,255,0.78)',
        padding: '1px 5px',
        borderRadius: 999,
        opacity: isHover ? 1 : 0.75,
        transition: 'opacity 200ms',
        pointerEvents: 'none',
      }}>
        {f.author_name}
      </div>
    </motion.button>
  )
})

// ── 컨테이너용 정적 인라인 스타일 — 상수화로 리렌더 시 동일 참조 유지 ──
const CONTAINER_STYLE: React.CSSProperties = {
  position: 'fixed', inset: 0, overflow: 'hidden', background: '#e8f3e0',
  fontFamily: '"Pretendard","Apple SD Gothic Neo","Noto Sans KR",sans-serif',
}
// 안개 띠 — 흐린 날 느낌 완화를 위해 opacity 절반으로 축소
const MIST_STYLE: React.CSSProperties = {
  position: 'absolute', left: 0, right: 0, top: '58%', height: 60,
  background: 'linear-gradient(to bottom, rgba(255,255,255,0.18), rgba(255,255,255,0))',
  pointerEvents: 'none', zIndex: 2,
}
// 배지는 헤더 아래로 분리되었으므로 paddingRight는 제거. 좌우 여백만 유지.
// 우측 상단 배지(폭 ~150px + right:20)와 제목 겹침 방지용 paddingRight.
const HEADER_STYLE: React.CSSProperties = { position: 'absolute', top: 28, left: 20, right: 20, paddingRight: 170, zIndex: 10, color: '#3a5a3a' }
const FLOWERS_LAYER_STYLE: React.CSSProperties = { position: 'absolute', inset: 0, zIndex: 5 }
const BOTTOM_BAR_STYLE: React.CSSProperties = {
  position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
  display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 20px 20px',
}
const LIST_BUTTON_STYLE: React.CSSProperties = {
  width: 44, height: 44, borderRadius: '50%',
  background: 'rgba(255,255,255,0.45)',
  border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 16,
  backdropFilter: 'blur(4px)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────────────────
// forwardRef로 root div의 ref를 외부에 노출 — 이미지 캡처 시 정확한 dimensions 확보용.
const MeadowView = forwardRef<HTMLDivElement, Props>(function MeadowView(
  { messages, recipientName, onFlowerClick, onListMode, onWriteMessage },
  ref,
) {
  const placed  = useMemo(() => distributeFlowers(messages), [messages])
  const honorific = honorificSuffix(recipientName)
  // 제목 첫 줄("이름honorific")이 우측 상단 배지와 겹치지 않도록 글자 수에 따라 폰트 크기 자동 축소.
  // 가용폭 ≈ 185px (375 - 좌여백 20 - paddingRight 170). 실측 한글 bold char 폭 ≈ fontSize * 0.85.
  // 따라서 fontSize ≤ 185 / (len * 0.85), 상한 28px·하한 14px(가독성).
  const firstLineLen  = recipientName.length + honorific.length
  const titleFontSize = Math.max(14, Math.min(28, Math.floor(185 / (firstLineLen * 0.85))))

  return (
    <div ref={ref} style={CONTAINER_STYLE}>

      {/* ── 수채화 배경 ── */}
      <Scenery variant="spring"/>

      {/* ── 안개 미스트 ── */}
      <div style={MIST_STYLE}/>

      {/* ── 헤더 ── */}
      <div style={HEADER_STYLE}>
        <h1 style={{ margin: 0, fontSize: titleFontSize, fontWeight: 800, color: '#2d4a2d', lineHeight: 1.2, textShadow: '0 1px 0 rgba(255,255,255,0.5)', wordBreak: 'keep-all' }}>
          {/* 첫 줄: 이름+honorific을 nowrap으로 묶어 항상 한 줄 유지 (폰트가 자동 축소되어 가용폭에 들어감) */}
          <span style={{ whiteSpace: 'nowrap' }}>
            <span style={{ color: '#c25a7e' }}>{recipientName}</span>{honorific}
          </span>
          <br/>
          보내는 마음들
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#5a7a5a' }}>
          풀숲에 꽃이 피어나고 있어요 🌿
        </p>
      </div>

      {/* ── 꽃 개수 배지 ── */}
      <CountBadge count={messages.length}/>

      {/* ── 꽃들 ── */}
      <div style={FLOWERS_LAYER_STYLE} aria-label="롤링페이퍼 풀숲">
        {placed.map((f, i) => (
          <FlowerCell
            key={f.id}
            flower={f}
            animDelayIdx={i}
            onClick={onFlowerClick}
          />
        ))}
      </div>

      {/* ── 하단 바 — 리스트 토글 (+ 참여자 연필 버튼은 위에 쌓임) ── */}
      <div style={BOTTOM_BAR_STYLE}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {/* 참여자 전용 — 메시지 작성·수정 (리스트 버튼 위) */}
          {onWriteMessage && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onWriteMessage}
              style={LIST_BUTTON_STYLE}
              aria-label="메시지 작성하기"
              data-export-hide
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2"
                   strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onListMode}
            style={LIST_BUTTON_STYLE}
            aria-label="전체 메시지 목록 보기"
          >
            ☰
          </motion.button>
        </div>
      </div>
    </div>
  )
})
export default MeadowView
