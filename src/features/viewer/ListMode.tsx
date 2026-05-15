import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { FLOWER_EMOJIS, type FlowerShape } from '../message-write/utils'

interface Message { id: string; author_name: string; shape: string; body: string; created_at: string }
interface Props {
  messages:      Message[]
  recipientName: string
  onClose:       () => void
}

// forwardRef로 root에 ref를 노출해 이미지 캡처가 정확한 dimensions를 얻을 수 있게 한다.
const ListMode = forwardRef<HTMLElement, Props>(function ListMode(
  { messages, recipientName, onClose },
  ref,
) {
  const honorific = recipientName.endsWith('님') ? '께' : '님께'

  return (
    <motion.main
      ref={ref}
      className="min-h-dvh bg-white px-5 py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full max-w-md mx-auto">

        {/* 헤더 */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-[1.6rem] font-black text-black leading-tight">
              {recipientName}{honorific}<br />보내는 마음들
            </h1>
            <p className="text-black/40 text-[14px] mt-1">{messages.length}개의 메시지</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 mt-1 px-4 py-2 rounded-full border border-[#e6e6e6]
                       hover:border-black/30 text-[13px] text-black/50 hover:text-black
                       transition-colors focus:outline-none focus:ring-2 focus:ring-black/20"
            aria-label="풀숲 뷰로 돌아가기"
          >
            풀숲으로 ↩
          </button>
        </div>

        {/* 메시지 리스트 */}
        <div className="space-y-4" role="list" aria-label="전체 메시지 목록">
          {messages.map((msg, i) => {
            const emoji = FLOWER_EMOJIS[msg.shape as FlowerShape] ?? '🌸'
            return (
              <motion.article
                key={msg.id}
                role="listitem"
                className="rounded-2xl bg-[#f5f5f5] px-5 py-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                // H2: 누적 delay를 0.3s로 캡 — 메시지가 많을 때 마지막 카드가
                // 1초 이상 지연돼 보이지 않던 문제를 막는다.
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl leading-none">{emoji}</span>
                  <div>
                    <p className="text-[14px] font-bold text-black">{msg.author_name}</p>
                    <p className="text-[11px] text-black/35">
                      {new Date(msg.created_at).toLocaleDateString('ko-KR', {
                        month: 'long', day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <p className="text-[16px] text-black leading-relaxed whitespace-pre-wrap">
                  {msg.body}
                </p>
              </motion.article>
            )
          })}
        </div>
      </div>
    </motion.main>
  )
})
export default ListMode
