import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import UnwrapAnimation from './UnwrapAnimation'
import MeadowView      from './MeadowView'
import MessageModal    from './MessageModal'
import ListMode        from './ListMode'
import ExportModal     from '../image-export/ExportModal'

interface Room { id: string; recipient_name: string; expires_at: string; status: string; open_key: string }
interface Message { id: string; author_name: string; shape: string; body: string; created_at: string }
type ViewState = 'loading' | 'invalid' | 'animating' | 'meadow'

export default function ViewerPage() {
  const { slug }        = useParams<{ slug: string }>()
  const [params]        = useSearchParams()
  const openKey         = params.get('k') ?? ''

  const [viewState, setViewState]   = useState<ViewState>('loading')
  const [room, setRoom]             = useState<Room | null>(null)
  const [messages, setMessages]     = useState<Message[]>([])
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [isListMode, setIsListMode] = useState(false)
  const [showExport, setShowExport] = useState(false)

  // 캡처 대상 ref
  const meadowRef = useRef<HTMLDivElement>(null)
  const listRef   = useRef<HTMLDivElement>(null)

  // ─── 방 + 메시지 로드 ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!slug) return
    supabase.from('rooms')
      .select('id, recipient_name, expires_at, status, open_key')
      .eq('slug', slug)
      .single()
      .then(async ({ data, error }) => {
        // open_key 불일치 또는 미포장 상태면 invalid
        if (error || !data || data.status !== 'wrapped' || data.open_key !== openKey) {
          setViewState('invalid'); return
        }
        setRoom(data)
        const { data: msgs } = await supabase.from('messages')
          .select('id, author_name, shape, body, created_at')
          .eq('room_id', data.id)
          .order('created_at', { ascending: true })
        setMessages(msgs ?? [])
        setViewState('animating')
      })
  }, [slug, openKey])

  // ─── 로딩 ─────────────────────────────────────────────────────────────────
  if (viewState === 'loading') return (
    <main className="min-h-dvh bg-[#14532d] flex items-center justify-center">
      <span className="text-4xl animate-pulse">🌿</span>
    </main>
  )

  // ─── 유효하지 않은 링크 ───────────────────────────────────────────────────
  if (viewState === 'invalid') return (
    <main className="min-h-dvh bg-white flex items-center justify-center px-5">
      <div className="text-center">
        <p className="text-5xl mb-5">🌱</p>
        <p className="text-[17px] font-bold text-black/70">아직 준비 중인 롤링페이퍼예요</p>
        <p className="text-[14px] text-black/40 mt-2 leading-relaxed">
          링크를 다시 확인하거나<br />조금 기다려 주세요
        </p>
      </div>
    </main>
  )

  // ─── 전체 리스트 모드 ─────────────────────────────────────────────────────
  if (isListMode) return (
    <>
      <div ref={listRef}>
        <ListMode
          messages={messages}
          recipientName={room?.recipient_name ?? ''}
          onClose={() => setIsListMode(false)}
        />
      </div>
      {/* 이미지 저장 버튼 */}
      <button
        onClick={() => setShowExport(true)}
        data-export-hide
        className="fixed bottom-5 right-5 z-20 flex items-center gap-2
                   px-4 py-2.5 bg-white rounded-full shadow-lg
                   text-[13px] font-bold text-black/70 hover:text-black
                   border border-black/10 hover:border-black/20 transition-all"
      >
        📥 이미지 저장
      </button>
      <AnimatePresence>
        {showExport && (
          <ExportModal
            recipientName={room?.recipient_name ?? ''}
            messages={messages}
            meadowRef={meadowRef}
            listRef={listRef}
            onClose={() => setShowExport(false)}
          />
        )}
      </AnimatePresence>
    </>
  )

  // ─── 애니메이션 + 풀숲 뷰 ─────────────────────────────────────────────────
  return (
    <>
      <AnimatePresence>
        {viewState === 'animating' && (
          <UnwrapAnimation
            recipientName={room?.recipient_name ?? ''}
            onComplete={() => setViewState('meadow')}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewState === 'meadow' && (
          <motion.div
            key="meadow"
            ref={meadowRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <MeadowView
              messages={messages}
              recipientName={room?.recipient_name ?? ''}
              expiresAt={room?.expires_at ?? ''}
              onFlowerClick={setSelectedIdx}
              onListMode={() => setIsListMode(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 이미지 저장 버튼 (풀숲 모드) */}
      {viewState === 'meadow' && (
        <button
          onClick={() => setShowExport(true)}
          data-export-hide
          className="fixed bottom-20 right-5 z-20 flex items-center gap-2
                     px-4 py-2.5 bg-white/90 rounded-full shadow-lg
                     text-[13px] font-bold text-black/70 hover:text-black
                     border border-black/10 backdrop-blur-sm transition-all"
        >
          📥 저장
        </button>
      )}

      {/* 메시지 모달 */}
      <AnimatePresence>
        {selectedIdx !== null && viewState === 'meadow' && (
          <MessageModal
            messages={messages}
            currentIndex={selectedIdx}
            onNavigate={setSelectedIdx}
            onClose={() => setSelectedIdx(null)}
          />
        )}
      </AnimatePresence>

      {/* 이미지 저장 모달 */}
      <AnimatePresence>
        {showExport && (
          <ExportModal
            recipientName={room?.recipient_name ?? ''}
            messages={messages}
            meadowRef={meadowRef}
            listRef={listRef}
            onClose={() => setShowExport(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
