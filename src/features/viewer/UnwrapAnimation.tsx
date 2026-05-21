import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { honorificSuffix } from '../../lib/honorific'

interface Props {
  recipientName: string
  onComplete: () => void
}

type Phase = 'intro' | 'sparkle'

const SPARKLES = ['🌸', '🌼', '🌿', '⭐', '🍀', '🌷', '✨', '💐']

// 각 phase motion의 exit 트랜지션 — 짧고 일관된 ease-in tween.
// 이전엔 motion 전체에 spring(stiffness 200, damping 기본 10)이 적용돼 있어
// underdamped 진동이 일어났고, opacity가 0 부근에서 한 사이클 진동하면서
// "사라졌다가 0.5초 정도 다시 잠깐 보이고 사라지는" 잔상이 발생했다.
// enter는 spring(튕기는 디자인 의도)을 유지하고, exit만 tween으로 빼낸다.
const PHASE_EXIT_TRANSITION = { duration: 0.3, ease: 'easeIn' as const }

export default function UnwrapAnimation({ recipientName, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [exiting, setExiting] = useState(false)

  // skip / 자동 진행 양쪽 모두에서 onComplete가 정확히 1회만 호출되도록
  // mounted 플래그와 타이머 ref를 둔다.
  const completedRef = useRef(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  // onComplete를 ref에 보관해 useEffect 의존성에서 빼낸다.
  // 부모(ViewerPage)가 inline arrow를 내려보내고 있어, 의존성에 onComplete를
  // 그대로 두면 부모 re-render마다 타이머가 cleanup→재등록되어 phase 전환이
  // 다시 일어나면서 인트로 문구가 또 한 번 잠깐 뜨는 잔상이 생긴다.
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  useEffect(() => {
    // phase 전환만 타이머로 처리. onComplete는 외부 motion.div의 exit 애니메이션이
    // 진짜 끝났을 때 AnimatePresence.onExitComplete에서 호출한다.
    // 이전엔 setTimeout(safeComplete, 3400)으로 직접 호출했는데, exit transition과
    // timing이 어긋나면 motion이 완전히 사라지기 전에 부모가 viewState를 바꾸어
    // UnwrapAnimation이 unmount되면서 마지막 프레임에 잔상이 생기는 일이 있었다.
    timersRef.current = [
      setTimeout(() => setPhase('sparkle'), 1200),
      setTimeout(() => setExiting(true),    3100),
    ]

    return () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  }, [])

  // 외부 motion.div의 exit가 진짜 완료된 시점에만 onComplete 호출.
  const handleExitComplete = () => {
    if (completedRef.current) return
    completedRef.current = true
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    onCompleteRef.current()
  }

  function skip() {
    if (completedRef.current) return
    // 진행 중인 phase 타이머 정리 — exit 완료 시 onExitComplete가 호출됨
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    setExiting(true)
  }

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
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
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={{
                    hidden:  {},
                    visible: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
                    exit:    { transition: { staggerChildren: 0.06, staggerDirection: -1 } },
                  }}
                >
                  <motion.p
                    className="text-white text-4xl font-extrabold leading-tight"
                    variants={{
                      hidden:  { opacity: 0, y: 14 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
                      exit:    { opacity: 0, y: -6, transition: { duration: 0.3, ease: 'easeIn' } },
                    }}
                  >
                    {recipientName}{honorificSuffix(recipientName)}
                  </motion.p>
                  <motion.p
                    className="text-white/70 text-xl mt-3"
                    variants={{
                      hidden:  { opacity: 0, y: 14 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
                      exit:    { opacity: 0, y: -6, transition: { duration: 0.3, ease: 'easeIn' } },
                    }}
                  >
                    롤링페이퍼가 도착했어요
                  </motion.p>
                </motion.div>
              )}

              {phase === 'sparkle' && (
                <motion.div
                  key="sparkle"
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.1, opacity: 0, transition: PHASE_EXIT_TRANSITION }}
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
