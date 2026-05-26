import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MeadowView from '../features/viewer/MeadowView'
import MessageModal from '../features/viewer/MessageModal'
import ListMode from '../features/viewer/ListMode'
import UnwrapAnimation from '../features/viewer/UnwrapAnimation'
import type { FlowerShape } from '../features/message-write/utils'

// ── 홍보 영상용 showcase 페이지 ─────────────────────────────────────────────
// 10대 학생 14명이 선생님께 롤링페이퍼를 쓴 시나리오. 실제 DB 없이 mock 데이터로
// 받는 분 진입 흐름(포장 풀기 애니메이션 → 풀숲 뷰)을 그대로 재현한다. URL `/showcase/teacher`.

interface ShowcaseMessage {
  id: string
  author_name: string
  shape: FlowerShape
  body: string
  created_at: string
}

// 14명 — 자연스러운 다양성을 위해 학생 이름은 한 글자~세 글자 혼합
// 10대 톤: 일부 메시지에 하트·표정 이모지·"ㅋㅋ/ㅠㅠ/ㅎㅎ"를 자연스럽게 섞음
const STUDENTS: Array<{ name: string; shape: FlowerShape; body: string }> = [
  { name: '지민', shape: 'carnation', body: '선생님 덕분에 수학이 더 이상 무섭지 않아요! 1년 동안 정말 감사했습니다 🌷' },
  { name: '박서연', shape: 'daisy',     body: '힘들 때마다 해주신 따뜻한 말 한마디가 진짜 큰 힘이 됐어요 ㅠㅠ 평생 기억할게요 💖' },
  { name: '도현',   shape: 'tulip',     body: '수업 시간이 진짜 기다려졌어요. 선생님 같은 어른이 되고 싶어요!' },
  { name: '하윤',   shape: 'clover',    body: '진로 고민 들어주셔서 감사해요 💕 덕분에 결심했어요. 잊지 않을게요!' },
  { name: '시우',   shape: 'sunflower', body: '선생님 농담 진짜 재미있었어요 ㅋㅋㅋ 보고 싶을 거예요 🌻' },
  { name: '예준',   shape: 'carnation', body: '시험 망쳤을 때 다시 일어설 수 있게 해주셔서 정말 감사해요 ㅠㅠ 🥺' },
  { name: '윤서',   shape: 'daisy',     body: '매일 아침 환하게 인사 받아주신 거, 그게 진짜 큰 힘이었어요 😊' },
  { name: '한주원', shape: 'tulip',     body: '제가 자신감이 생긴 건 다 선생님 덕분이에요. 감사합니다 🌿' },
  { name: '강하준', shape: 'clover',    body: '좋은 어른이 되라는 말씀, 마음에 새겼습니다. 부끄럽지 않은 사람 될게요 ㅎㅎ' },
  { name: '서아',   shape: 'sunflower', body: '선생님 같은 선생님 다시 만날 수 있을까요? ❤️ 너무 감사드려요!' },
  { name: '지호',   shape: 'daisy',     body: '늘 친절하게 가르쳐주셔서 감사해요. 항상 건강하세요!! 🤍' },
  { name: '수아',   shape: 'carnation', body: '제 이야기 끝까지 들어주셔서 감사해요 🥰 그날 정말 행복했어요.' },
  { name: '건우',   shape: 'tulip',     body: '졸업해도 자주 인사드리러 갈게요! 늘 행복하셨으면 좋겠습니다 ✨' },
  { name: '유나',   shape: 'clover',    body: '저한테 선생님은 정말 큰 선물 같은 분이었어요. 진심으로 감사합니다 💐' },
]

const RECIPIENT_NAME = '김민영 선생님'

function buildMessages(): ShowcaseMessage[] {
  // 작성 시각을 약 30분 간격으로 분산 — 자연스럽게 모인 느낌
  const baseTime = new Date('2026-05-15T09:00:00+09:00').getTime()
  return STUDENTS.map((s, i) => ({
    id: `showcase-${i}`,
    author_name: s.name,
    shape:       s.shape,
    body:        s.body,
    created_at:  new Date(baseTime + i * 30 * 60_000).toISOString(),
  }))
}

type ViewState = 'animating' | 'meadow'

export default function ShowcaseTeacherPage() {
  const messages = useMemo(buildMessages, [])
  const [viewState, setViewState]     = useState<ViewState>('animating')
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [isListMode,  setIsListMode]  = useState(false)

  // ── 리스트 모드 — ViewerPage와 동일하게 early return으로 MeadowView를 언마운트.
  // (MeadowView가 position: fixed라 함께 렌더되면 ListMode를 덮어버린다.)
  if (viewState === 'meadow' && isListMode) {
    return (
      <ListMode
        messages={messages}
        recipientName={RECIPIENT_NAME}
        onClose={() => setIsListMode(false)}
      />
    )
  }

  return (
    <>
      {/* ── 포장 풀기 인트로 애니메이션 ── */}
      <AnimatePresence>
        {viewState === 'animating' && (
          <UnwrapAnimation
            recipientName={RECIPIENT_NAME}
            onComplete={() => setViewState('meadow')}
          />
        )}
      </AnimatePresence>

      {/* ── 풀숲 뷰 — 페이드 인 ── */}
      <AnimatePresence>
        {viewState === 'meadow' && (
          <motion.div
            key="meadow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <MeadowView
              messages={messages}
              recipientName={RECIPIENT_NAME}
              onFlowerClick={setSelectedIdx}
              onListMode={() => setIsListMode(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {viewState === 'meadow' && selectedIdx !== null && (
        <MessageModal
          messages={messages}
          currentIndex={selectedIdx}
          onNavigate={setSelectedIdx}
          onClose={() => setSelectedIdx(null)}
        />
      )}
    </>
  )
}
