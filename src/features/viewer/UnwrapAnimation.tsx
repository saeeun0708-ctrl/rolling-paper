import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  recipientName: string
  onComplete: () => void
}

type Phase = 'intro' | 'open' | 'sparkle'

const SPARKLES = ['🌸', '🌼', '🌿', '⭐', '🍀', '🌷', '✨', '💐']

export default function UnwrapAnimation({ recipientName, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('open'),    900)
    const t2 = setTimeout(() => setPhase('sparkle'), 1900)
    const t3 = setTimeout(() => setExiting(true),   2900)
    const t4 = setTimeout(() => onComplete(),        3400)
    return () => [t1, t2, t3, t4].forEach(clearTimeout)
  }, [onComplete])

  function skip() { setExiting(true); setTimeout(onComplete, 400) }

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="wrap"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none"
          style={{ background: 'linear-gradient(180deg, #14532d 0%, #166534 50%, #15803d 100%)' }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5 }}
        >
          {/* 건너뛰기 */}
          <button
            onClick={skip}
            className="absolute top-6 right-6 text-white/50 hover:text-white
                       text-[13px] transition-colors px-3 py-1 rounded-full
                       border border-white/20 hover:border-white/50"
            aria-label="애니메이션 건너뛰기"
          >
            건너뛰기
          </button>

          {/* 중앙 이모지 */}
          <div className="text-center">
            <AnimatePresence mode="wait">
              {phase === 'intro' && (
                <motion.div
                  key="intro"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.3, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <div className="text-8xl mb-5">📜</div>
                  <p className="text-white/70 text-xl font-bold">{recipientName}님께</p>
                  <p className="text-white/40 text-sm mt-1">롤링페이퍼가 도착했어요</p>
                </motion.div>
              )}

              {phase === 'open' && (
                <motion.div
                  key="open"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [0.5, 1.2, 0.9, 1.1, 1], opacity: 1, rotate: [0, -8, 8, -4, 0] }}
                  exit={{ scale: 1.4, opacity: 0 }}
                  transition={{ duration: 0.9 }}
                >
                  <div className="text-8xl mb-5">🌸</div>
                  <p className="text-white/60 text-lg">열리고 있어요...</p>
                </motion.div>
              )}

              {phase === 'sparkle' && (
                <motion.div
                  key="sparkle"
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 250 }}
                >
                  <div className="text-8xl mb-5">✨</div>
                  <p className="text-white text-xl font-black">마음들이 피어났어요</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 파티클 스파클 */}
          {phase === 'sparkle' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
              {SPARKLES.map((emoji, i) => (
                <motion.span
                  key={i}
                  className="absolute text-2xl"
                  style={{ left: `${10 + i * 11}%`, top: '55%' }}
                  initial={{ opacity: 0, y: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 1, 0], y: -120 - i * 12, scale: [0, 1, 1, 0] }}
                  transition={{ duration: 1.1, delay: i * 0.06 }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
