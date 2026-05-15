import { motion, AnimatePresence } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import { FLOWER_EMOJIS, type FlowerShape } from '../message-write/utils'

interface Message { id: string; author_name: string; shape: string; body: string; created_at: string }
interface Props {
  messages:     Message[]
  currentIndex: number
  onNavigate:   (index: number) => void
  onClose:      () => void
  /** 만든이 권한일 때만 — 메시지 삭제 콜백. 없으면 삭제 버튼 미노출 */
  onDelete?:    (messageId: string) => void
  /** 이 기기에서 작성한 메시지 id 목록 — 포함된 메시지에 '수정·삭제' 버튼 노출 */
  myMessageIds?: string[]
  /** 본인 메시지 수정 클릭 시 호출 — 어떤 메시지인지 id 전달 */
  onEdit?:       (messageId: string) => void
  /** 본인 메시지 삭제 클릭 시 호출 — 참여자 본인 삭제용 */
  onMyDelete?:   (messageId: string) => void
}

export default function MessageModal({ messages, currentIndex, onNavigate, onClose, onDelete, myMessageIds, onEdit, onMyDelete }: Props) {
  const msg    = messages[currentIndex]
  const isMine = !!myMessageIds?.includes(msg.id)
  const emoji = FLOWER_EMOJIS[msg.shape as FlowerShape] ?? '🌸'
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
          <div className="text-6xl leading-none">{emoji}</div>

          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-black/40 mt-4 mb-1">
            From
          </p>
          <p className="text-[17px] font-black text-black mb-5">{msg.author_name}</p>

          <p className="text-[16px] text-black leading-relaxed whitespace-pre-wrap min-h-[60px]">
            {msg.body}
          </p>

          {/* 액션 라인 — 수정 / 삭제 */}
          {(isMine && onEdit) || (isMine && onMyDelete) || onDelete ? (
            <div className="mt-5 flex items-center justify-center gap-4">
              {isMine && onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(msg.id)}
                  className="text-[12px] font-semibold text-black/55 hover:text-black transition-colors"
                >
                  수정
                </button>
              )}
              {isMine && onMyDelete && (
                <button
                  type="button"
                  onClick={() => onMyDelete(msg.id)}
                  className="text-[12px] text-black/35 hover:text-red-500 transition-colors"
                >
                  삭제
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`${msg.author_name}님의 메시지를 삭제할까요?`)) {
                      onDelete(msg.id)
                    }
                  }}
                  className="text-[12px] text-black/35 hover:text-red-500 transition-colors"
                >
                  삭제
                </button>
              )}
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      {/* 방향 버튼 — 글래스모피즘 + SVG chevron */}
      {hasPrev && (
        <button
          onClick={() => onNavigate(currentIndex - 1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10
                     bg-white/10 hover:bg-white/25 active:bg-white/35
                     rounded-full backdrop-blur-md
                     ring-1 ring-white/15
                     text-white flex items-center justify-center
                     transition-all focus:outline-none focus:ring-2 focus:ring-white/40"
          aria-label="이전 메시지"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5"
               strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      )}
      {hasNext && (
        <button
          onClick={() => onNavigate(currentIndex + 1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10
                     bg-white/10 hover:bg-white/25 active:bg-white/35
                     rounded-full backdrop-blur-md
                     ring-1 ring-white/15
                     text-white flex items-center justify-center
                     transition-all focus:outline-none focus:ring-2 focus:ring-white/40"
          aria-label="다음 메시지"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5"
               strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      )}
    </motion.div>
  )
}
