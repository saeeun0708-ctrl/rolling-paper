import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { type FlowerShape } from '../message-write/utils'
import Scenery from './Scenery'
import { FLOWER_SVG_COMPONENTS, type FlowerSvgShape } from './FlowerSvg'

interface Message { id: string; author_name: string; shape: string; body: string; created_at: string }
interface Props {
  messages:      Message[]
  recipientName: string
  expiresAt:     string
  onFlowerClick: (index: number) => void
  onListMode:    () => void
}

// ── 꽃 shape → SVG 컴포넌트 매핑 (없으면 daisy 폴백) ──────────────────────
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

// ── 원근감 있는 꽃 배치 (Y 아래쪽이 더 크고 앞) ──────────────────────────
interface PlacedFlower extends Message {
  x: number; y: number; size: number; depth: number; sway: number
}

function distributeFlowers(messages: Message[], seed = 7): PlacedFlower[] {
  const n = messages.length
  if (n === 0) return []
  const cols = Math.max(4, Math.ceil(Math.sqrt(n) * 1.6))
  const rows  = Math.ceil(n / cols)
  const yMin = 62, yMax = 93

  let s = seed * 9301 + 49297
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }

  const placed: PlacedFlower[] = []
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / cols)
    const c = i % cols
    const cellW = 92 / cols
    const cellH = (yMax - yMin) / Math.max(1, rows)
    const xJitter = (rand() - 0.5) * cellW * 0.6
    const yJitter = (rand() - 0.5) * cellH * 0.5
    const x = 4 + c * cellW + cellW / 2 + xJitter
    const y = yMin + r * cellH + cellH / 2 + yJitter
    const depth = (y - yMin) / (yMax - yMin)
    // 메시지 수에 따라 자동 크기 조절: 적을수록 크게, 많을수록 작게
    const baseSize = Math.max(44, 110 - n * 3.5)
    const size = baseSize * (0.6 + depth * 0.65)
    placed.push({ ...messages[i], x, y, size, depth, sway: rand() * 6 - 3 })
  }
  return placed.sort((a, b) => a.depth - b.depth)
}

function fmtExpiry(d: string) {
  return new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

// ── 꽃 개수 배지 ──────────────────────────────────────────────────────────
function CountBadge({ count }: { count: number }) {
  return (
    <div style={{
      position: 'absolute', top: 28, right: 20, zIndex: 10,
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '7px 14px 7px 10px',
      background: '#fffdf8',
      borderRadius: 999,
      boxShadow: '0 6px 18px rgba(40,60,40,0.12), inset 0 0 0 1px rgba(194,90,126,0.15)',
    }}>
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

// ── 메인 컴포넌트 ──────────────────────────────────────────────────────────
export default function MeadowView({ messages, recipientName, expiresAt, onFlowerClick, onListMode }: Props) {
  const placed  = useMemo(() => distributeFlowers(messages), [messages])
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const honorific = recipientName.endsWith('님') ? '께' : '님께'

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#e8f3e0', fontFamily: '"Pretendard","Apple SD Gothic Neo","Noto Sans KR",sans-serif' }}>

      {/* ── 수채화 배경 ── */}
      <Scenery variant="spring"/>

      {/* ── 안개 미스트 ── */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: '58%', height: 80,
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.35), rgba(255,255,255,0))',
        pointerEvents: 'none', zIndex: 2,
      }}/>

      {/* ── 헤더 ── */}
      <div style={{ position: 'absolute', top: 28, left: 20, zIndex: 10, color: '#3a5a3a' }}>
        <p style={{ margin: 0, fontSize: 11, color: '#7a9676', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
          Rolling Paper
        </p>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#2d4a2d', lineHeight: 1.2, textShadow: '0 1px 0 rgba(255,255,255,0.5)' }}>
          <span style={{ color: '#c25a7e' }}>{recipientName}</span>{honorific}<br/>
          보내는 마음들
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#5a7a5a' }}>
          풀숲에 꽃이 피어나고 있어요 🌿
        </p>
      </div>

      {/* ── 꽃 개수 배지 ── */}
      <CountBadge count={messages.length}/>

      {/* ── 꽃들 ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 5 }} aria-label="롤링페이퍼 풀숲">
        {placed.map((f, i) => {
          const svgKey  = SHAPE_MAP[f.shape as FlowerShape] ?? 'daisy'
          const FlowerComp = FLOWER_SVG_COMPONENTS[svgKey]
          const isHover = hoveredId === f.id

          return (
            <motion.button
              key={f.id}
              onClick={() => onFlowerClick(messages.findIndex(m => m.id === f.id))}
              onHoverStart={() => setHoveredId(f.id)}
              onHoverEnd={() => setHoveredId(null)}
              initial={{ scale: 0, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: (i % 20) * 0.07, type: 'spring', stiffness: 200, damping: 14 }}
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
                filter: isHover
                  ? `drop-shadow(0 6px 14px rgba(194,90,126,0.4))`
                  : `drop-shadow(0 3px 5px rgba(0,0,0,0.18))`,
                zIndex: Math.floor(f.depth * 100) + 5,
              }}
              aria-label={`${f.author_name}님의 메시지 보기`}
            >
              <FlowerComp size={f.size}/>
              {/* 이름 레이블 */}
              <div style={{
                position: 'absolute', left: '50%', bottom: -2,
                transform: 'translateX(-50%)',
                fontSize: Math.max(9, f.size * 0.18),
                color: '#2d4a2d',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                background: 'rgba(255,255,255,0.78)',
                padding: '1px 6px',
                borderRadius: 999,
                opacity: isHover ? 1 : 0.75,
                transition: 'opacity 200ms',
                pointerEvents: 'none',
              }}>
                {f.author_name}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* ── 하단 바 ── */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 20px 20px' }}>
        {expiresAt && (
          <p style={{
            margin: 0, fontSize: 11, lineHeight: 1.6,
            color: 'rgba(255,255,255,0.85)',
            background: 'rgba(40,60,40,0.3)',
            padding: '8px 12px', borderRadius: 10,
            backdropFilter: 'blur(4px)',
            maxWidth: '60%',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          }}>
            {fmtExpiry(expiresAt)}에 사라져요.<br/>이미지로 저장해 보관하세요.
          </p>
        )}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onListMode}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(255,255,255,0.45)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, marginLeft: 'auto',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
          aria-label="전체 메시지 목록 보기"
        >
          ☰
        </motion.button>
      </div>

      {/* ── 애니메이션 CSS ── */}
      <style>{`
        @keyframes bloom {
          0%   { transform: translate(-50%,-85%) scale(0.1) rotate(-15deg); opacity: 0; }
          60%  { transform: translate(-50%,-85%) scale(1.15) rotate(4deg); opacity: 1; }
          100% { transform: translate(-50%,-85%) scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
