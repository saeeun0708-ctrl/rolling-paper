import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import MeadowView from '../features/viewer/MeadowView'
import MessageModal from '../features/viewer/MessageModal'
import { FLOWER_SHAPES, type FlowerShape } from '../features/message-write/utils'

// ── dev 전용 mock 풀숲 미리보기 ────────────────────────────────────────────
// `/dev/meadow-test?n=40` 형태로 메시지 개수를 바꿔가며 시각적으로 확인한다.
// 실제 DB·라우팅과 무관 — MeadowView를 가짜 데이터로 렌더링만 한다.

const NAMES = [
  '지민', '서연', '도현', '하윤', '시우', '예준', '윤서', '주원', '하준', '서아',
  '지호', '수아', '건우', '유나', '민준', '채원', '준우', '지유', '현우', '소율',
  '예원', '재이', '서진', '지아', '하랑', '도윤', '시아', '연우', '윤후', '나윤',
  '민서', '시현', '지원', '소이', '태민', '아인', '하린', '준영', '소민', '재현',
]

const BODIES = [
  '늘 따뜻하게 챙겨주셔서 감사해요. 오래오래 건강하세요 🌷',
  '엄마가 끓여주신 미역국이 제일 맛있어요. 사랑해요!',
  '아빠 덕분에 오늘의 제가 있어요. 정말 감사합니다.',
  '말로 다 표현 못 하지만, 마음 깊이 감사드려요.',
  '늘 응원해주셔서 든든해요. 저도 더 잘할게요.',
  '곁에 계셔주셔서 감사해요. 행복하셨으면 좋겠어요.',
  '바쁘다는 핑계로 자주 못 가서 죄송해요. 곧 갈게요!',
  '존재 자체로 큰 힘이 돼요. 사랑합니다.',
  '맛있는 거 많이 드시고 건강하세요 🍀',
  '오래오래 제 곁에 계셔주세요. 사랑해요.',
]

interface MockMessage {
  id: string
  author_name: string
  shape: string
  body: string
  created_at: string
}

function generateMockMessages(n: number): MockMessage[] {
  const now = Date.now()
  return Array.from({ length: n }, (_, i) => ({
    id: `mock-${i}`,
    author_name: NAMES[i % NAMES.length],
    shape: FLOWER_SHAPES[i % FLOWER_SHAPES.length] as FlowerShape,
    body: BODIES[i % BODIES.length],
    created_at: new Date(now - (n - i) * 60_000).toISOString(),
  }))
}

export default function MeadowTestPage() {
  const [params, setParams] = useSearchParams()
  const n = Math.max(1, Math.min(200, Number(params.get('n') ?? '40')))
  const messages = useMemo(() => generateMockMessages(n), [n])
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

  // 슬라이더로 개수 조절 — URL과 동기화하여 새로고침해도 유지
  const updateN = (next: number) => {
    setParams({ n: String(next) }, { replace: true })
  }

  return (
    <>
      <MeadowView
        messages={messages}
        recipientName="테스트"
        onFlowerClick={setSelectedIdx}
        onListMode={() => alert('리스트 모드는 mock에서 생략')}
      />

      {/* 개수 조절 컨트롤 — 좌하단 */}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          zIndex: 50,
          background: 'rgba(255,255,255,0.95)',
          padding: '10px 14px',
          borderRadius: 12,
          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          fontFamily: '"Pretendard","Apple SD Gothic Neo",sans-serif',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: '#2d4a2d' }}>
          mock messages: <span style={{ color: '#c25a7e' }}>{n}</span>
        </div>
        <input
          type="range"
          min={1}
          max={80}
          value={n}
          onChange={(e) => updateN(Number(e.target.value))}
          style={{ width: 180 }}
        />
        <div style={{ display: 'flex', gap: 4 }}>
          {[10, 20, 30, 40, 50, 60].map((v) => (
            <button
              key={v}
              onClick={() => updateN(v)}
              style={{
                fontSize: 11,
                padding: '3px 7px',
                borderRadius: 6,
                border: '1px solid #c8d8c0',
                background: n === v ? '#5cb054' : '#fff',
                color: n === v ? '#fff' : '#2d4a2d',
                cursor: 'pointer',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {selectedIdx !== null && (
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
