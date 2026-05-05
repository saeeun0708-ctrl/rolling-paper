import { motion } from 'framer-motion'
import { FLOWER_COMPONENTS, FLOWER_COLORS } from '../../components/flowers'
import type { FlowerShape } from '../message-write/utils'

interface Message { id: string; author_name: string; shape: string; body: string; created_at: string }
interface Props {
  messages:      Message[]
  recipientName: string
  expiresAt:     string
  onFlowerClick: (index: number) => void
  onListMode:    () => void
}

/** 꽃 위치 계산 — 격자 기반 + 결정론적 편차 (겹침 방지) */
function getPositions(n: number) {
  const cols = Math.ceil(Math.sqrt(n * 1.3))
  const rows = Math.ceil(n / cols)
  return Array.from({ length: n }, (_, i) => {
    const c = i % cols, r = Math.floor(i / cols)
    const dx = Math.sin(i * 7.31 + 1) * 0.32
    const dy = Math.cos(i * 5.73 + 2) * 0.28
    return {
      x: Math.max(8, Math.min(92, ((c + 0.5 + dx) / cols) * 100)),
      y: Math.max(6, Math.min(82, ((r + 0.5 + dy) / rows) * 100)),
    }
  })
}

function fmtExpiry(d: string) {
  return new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function MeadowView({ messages, recipientName, expiresAt, onFlowerClick, onListMode }: Props) {
  const positions  = getPositions(messages.length)
  const honorific  = recipientName.endsWith('님') ? '께' : '님께'

  return (
    <div
      className="relative min-h-dvh overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #bbf7d0 0%, #4ade80 35%, #16a34a 75%, #15803d 100%)' }}
    >
      {/* ─ 상단 헤더 ─ */}
      <div className="absolute top-0 left-0 right-0 z-10 px-5 pt-10 pb-4
                      bg-gradient-to-b from-black/20 to-transparent">
        <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-white/60 mb-1">
          Rolling Paper
        </p>
        <h1 className="text-[1.6rem] font-black text-white leading-tight drop-shadow">
          <span className="text-[#fbbf24]">{recipientName}</span>{honorific}<br />
          보내는 마음들
        </h1>
        <p className="text-white/70 text-[14px] mt-1 drop-shadow">
          {messages.length}개의 꽃이 피어났어요 🌸
        </p>
      </div>

      {/* ─ 꽃들 ─ */}
      <div className="absolute inset-0" aria-label="메시지 꽃밭">
        {messages.map((msg, i) => {
          const pos = positions[i]
          const shape = msg.shape as FlowerShape
          const Flower = FLOWER_COMPONENTS[shape] ?? FLOWER_COMPONENTS.carnation
          const color  = FLOWER_COLORS[shape]  ?? '#f43f67'
          return (
            <motion.button
              key={msg.id}
              className="absolute flex flex-col items-center cursor-pointer focus:outline-none"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 200 }}
              onClick={() => onFlowerClick(i)}
              aria-label={`${msg.author_name}님의 메시지 보기`}
            >
              <Flower size={46} color={color} label={shape} />
              <span
                className="text-[10px] font-bold text-white mt-0.5 max-w-[52px] truncate"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
              >
                {msg.author_name}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* ─ 풀숲 SVG ─ */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" aria-hidden>
        <svg viewBox="0 0 375 110" preserveAspectRatio="none" className="w-full">
          <path d="M0 55 Q50 30 90 50 Q130 28 170 46 Q210 24 250 44 Q290 22 330 42 Q360 30 375 38 L375 110 L0 110Z" fill="#166534"/>
          <path d="M0 72 Q40 55 80 68 Q120 52 160 65 Q200 48 240 63 Q280 50 320 62 Q350 52 375 58 L375 110 L0 110Z" fill="#15803d"/>
          <path d="M0 85 Q35 72 70 82 Q105 70 140 80 Q175 68 210 78 Q245 66 280 76 Q315 65 350 74 L375 78 L375 110 L0 110Z" fill="#14532d"/>
        </svg>
      </div>

      {/* ─ 하단 바 ─ */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between px-5 pb-4 pt-16
                      pointer-events-none">
        {/* 만료일 안내 */}
        {expiresAt && (
          <p className="text-[11px] text-white/55 max-w-[65%] leading-relaxed pointer-events-auto"
             style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
            이 롤링페이퍼는 {fmtExpiry(expiresAt)}에 사라져요.<br />
            이미지로 저장해 보관하세요.
          </p>
        )}
        {/* 전체 펼쳐 보기 */}
        <motion.button
          className="pointer-events-auto w-11 h-11 rounded-full bg-white/20 hover:bg-white/35
                     backdrop-blur flex items-center justify-center text-lg
                     focus:outline-none focus:ring-2 focus:ring-white/60 ml-auto"
          whileTap={{ scale: 0.9 }}
          onClick={onListMode}
          aria-label="전체 메시지 목록 보기"
          title="전체 펼쳐 보기"
        >
          ☰
        </motion.button>
      </div>
    </div>
  )
}
