import { motion, AnimatePresence } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import { FLOWER_COMPONENTS, FLOWER_COLORS } from '../../components/flowers'
import type { FlowerShape } from '../message-write/utils'

interface Message { id: string; author_name: string; shape: string; body: string; created_at: string }
interface Props {
  messages:     Message[]
  currentIndex: number
  onNavigate:   (index: number) => void
  onClose:      () => void
}

export default function MessageModal({ messages, currentIndex, onNavigate, onClose }: Props) {
  const msg    = messages[currentIndex]
  const shape  = msg.shape as FlowerShape
  const Flower = FLOWER_COMPONENTS[shape] ?? FLOWER_COMPONENTS.carnation
  const color  = FLOWER_COLORS[shape]  ?? '#f43f67'
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < messages.length - 1

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -60 && hasNext) onNavigate(currentIndex + 1)
    if (info.offset.x >  60 && hasPrev) onNavigate(currentIndex - 1)
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{ backgroundColor: 'rgba(0,0,0,0.72)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={`${msg.author_name}님의 메시지`}
    >
      {/* 닫기 */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center
                   text-white/70 hover:text-white text-2xl rounded-full
                   hover:bg-white/10 transition-colors"
        aria-label="메시지 닫기"
      >
        ✕
      </button>

      {/* 진행 점 표시 */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-1.5" aria-hidden>
        {messages.map((_, i) => (
          <button
            key={i}
            onClick={() => onNavigate(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === currentIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/35'
            }`}
            aria-label={`${i + 1}번째 메시지`}
          />
        ))}
      </div>

      {/* 메시지 카드 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl px-7 py-8 w-full max-w-sm text-center
                     cursor-grab active:cursor-grabbing shadow-2xl"
        >
          <Flower size={64} color={color} label={shape} className="mx-auto" />

          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-black/40 mt-4 mb-1">
            From
          </p>
          <p className="text-[17px] font-black text-black mb-5">{msg.author_name}</p>

          <p className="text-[16px] text-black leading-relaxed whitespace-pre-wrap min-h-[60px]">
            {msg.body}
          </p>

          <p className="text-[11px] text-black/30 mt-6">
            {new Date(msg.created_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
          </p>

          {/* 스와이프 힌트 */}
          {messages.length > 1 && (
            <p className="text-[11px] text-black/25 mt-3">
              {hasPrev && '← '} 스와이프해서 이동 {hasNext && ' →'}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 방향 버튼 */}
      {hasPrev && (
        <button
          onClick={() => onNavigate(currentIndex - 1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11
                     bg-white/20 hover:bg-white/35 rounded-full
                     text-white text-2xl flex items-center justify-center
                     transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="이전 메시지"
        >
          ‹
        </button>
      )}
      {hasNext && (
        <button
          onClick={() => onNavigate(currentIndex + 1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11
                     bg-white/20 hover:bg-white/35 rounded-full
                     text-white text-2xl flex items-center justify-center
                     transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="다음 메시지"
        >
          ›
        </button>
      )}
    </motion.div>
  )
}
