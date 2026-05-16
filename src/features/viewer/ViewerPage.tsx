import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import UnwrapAnimation from './UnwrapAnimation'
import MeadowView      from './MeadowView'
import MessageModal    from './MessageModal'
import ListMode        from './ListMode'
import ExportModal     from '../image-export/ExportModal'
import ShareModal      from '../../components/ShareModal'
import { getStoredAuthorsList, storeAuthorsList, type StoredAuthor } from '../message-write/utils'

interface Room { id: string; recipient_name: string; expires_at: string; status: string; open_key: string }
interface Message { id: string; author_name: string; shape: string; body: string; created_at: string }
type ViewState = 'loading' | 'invalid' | 'animating' | 'meadow'

interface Props {
  /** true면 만든이 미리보기 모드 — 포장 검증/애니메이션을 생략한다 */
  isPreview?: boolean
}

export default function ViewerPage({ isPreview = false }: Props) {
  const navigate        = useNavigate()
  const { slug }        = useParams<{ slug: string }>()
  const [params]        = useSearchParams()
  const openKey         = params.get('k') ?? ''

  const [viewState, setViewState]   = useState<ViewState>('loading')
  const [room, setRoom]             = useState<Room | null>(null)
  const [messages, setMessages]     = useState<Message[]>([])
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [isListMode, setIsListMode] = useState(false)
  const [showExport, setShowExport] = useState(false)
  // 참여자가 이 기기에서 작성한 메시지 목록 — 꽃 강조 + 수정·삭제 권한 판단용
  const [storedList, setStoredList] = useState<StoredAuthor[]>([])
  const [showShare, setShowShare] = useState(false)

  // 캡처 대상 ref — forwardRef로 MeadowView/ListMode root에 직접 부착.
  // 이전엔 wrapper div가 fixed 자식 때문에 0×0이 되어 이미지가 빈 PNG로 캡처됐다.
  const meadowRef = useRef<HTMLDivElement>(null)
  const listRef   = useRef<HTMLElement>(null)

  // ─── 방 + 메시지 로드 — useCallback으로 콜백 안정화 ─────────────────────────
  const fetchRoomAndMessages = useCallback(async () => {
    if (!slug) return

    // 미리보기 모드: 만든이 세션 또는 참여자 토큰 중 하나는 있어야 진입 가능.
    if (isPreview) {
      const isHost = sessionStorage.getItem(`rp_host_${slug}`) === 'ok'
      const list   = getStoredAuthorsList(slug)
      if (!isHost && list.length === 0) {
        navigate(`/r/${slug}`, { replace: true })
        return
      }
      if (list.length > 0) setStoredList(list)
    }

    const { data, error } = await supabase.from('rooms')
      .select('id, recipient_name, expires_at, status, open_key')
      .eq('slug', slug)
      .single()

    if (error || !data) { setViewState('invalid'); return }
    // 실서비스 진입(받는 분)은 status·open_key 검증을 통과해야 한다.
    // 미리보기 모드는 두 검증을 생략한다.
    if (!isPreview && (data.status !== 'wrapped' || data.open_key !== openKey)) {
      setViewState('invalid'); return
    }
    setRoom(data)
    const { data: msgs } = await supabase.from('messages')
      .select('id, author_name, shape, body, created_at')
      .eq('room_id', data.id)
      .order('created_at', { ascending: true })
    setMessages(msgs ?? [])
    // 포장 풀기 애니메이션은 받는 분 페이지에서만 재생한다.
    // 미리보기(만든이/참여자)는 바로 풀숲으로 진입한다.
    setViewState(isPreview ? 'meadow' : 'animating')
  }, [slug, openKey, isPreview, navigate])

  useEffect(() => {
    fetchRoomAndMessages()
  }, [fetchRoomAndMessages])

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

  // ─── 참여자 본인 메시지 삭제 ──────────────────────────────────────────────
  async function handleDeleteMyMessage(messageId: string) {
    if (!slug) return
    if (!window.confirm('내 메시지를 삭제할까요?')) return
    const { error } = await supabase.from('messages')
      .delete()
      .eq('id', messageId)
    if (error) { alert('삭제 중 오류가 발생했어요. 다시 시도해주세요.'); return }
    const newList = storedList.filter(s => s.messageId !== messageId)
    storeAuthorsList(slug, newList)
    setStoredList(newList)
    setMessages(prev => prev.filter(m => m.id !== messageId))
    setSelectedIdx(null)
  }

  // ─── 전체 리스트 모드 ─────────────────────────────────────────────────────
  if (isListMode) return (
    <>
      <ListMode
        ref={listRef}
        messages={messages}
        recipientName={room?.recipient_name ?? ''}
        onClose={() => setIsListMode(false)}
        myMessageIds={storedList.map(s => s.messageId)}
        onEdit={(messageId) => navigate(`/r/${slug}`, { state: { editMessageId: messageId } })}
      />
      {/* 이미지 저장 — 완성도 개선 후 노출 예정 */}
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

      {/* 상단 브랜드 워드마크 — 클릭 시 홈으로 */}
      {viewState === 'meadow' && (
        <button
          type="button"
          data-export-hide
          onClick={() => navigate('/create')}
          className="fixed top-0 inset-x-0 z-10 flex justify-center pt-3"
          aria-label="홈으로"
        >
          <p className="text-[10px] font-light tracking-[0.2em] text-black/20 select-none">
            Rolling paper&nbsp;&nbsp;|&nbsp;&nbsp;Pium
          </p>
        </button>
      )}

      <AnimatePresence>
        {viewState === 'meadow' && (
          <motion.div
            key="meadow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* MeadowView root에 직접 ref 부착 — wrapper로 감싸면 fixed 자식 때문에 0×0이 되어 캡처가 빈 PNG가 된다 */}
            <MeadowView
              ref={meadowRef}
              messages={messages}
              recipientName={room?.recipient_name ?? ''}
              onFlowerClick={setSelectedIdx}
              onListMode={() => setIsListMode(true)}
              myMessageIds={storedList.map(s => s.messageId)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 참여자(작성 완료자) — 더 많은 마음 모으기. 작성 링크를 친구에게 공유 */}
      {viewState === 'meadow' && isPreview && storedList.length > 0 && (
        <button
          onClick={() => setShowShare(true)}
          data-export-hide
          className="fixed bottom-5 right-5 z-20 flex items-center gap-2
                     px-4 py-2.5 bg-[#5cb054] hover:bg-[#4a9543] rounded-full shadow-lg
                     text-[13px] font-bold text-white
                     border border-black/5 transition-all"
        >
          🌿 더 많은 마음 모으기
        </button>
      )}

      {/* 메시지 모달 — 본인 메시지일 땐 '수정' 버튼 노출 */}
      <AnimatePresence>
        {selectedIdx !== null && viewState === 'meadow' && (
          <MessageModal
            messages={messages}
            currentIndex={selectedIdx}
            onNavigate={setSelectedIdx}
            onClose={() => setSelectedIdx(null)}
            myMessageIds={storedList.map(s => s.messageId)}
            onEdit={(messageId) => navigate(`/r/${slug}`, { state: { editMessageId: messageId } })}
            onMyDelete={storedList.length > 0 ? handleDeleteMyMessage : undefined}
          />
        )}
      </AnimatePresence>

      {/* 이미지 저장 모달 — 완성도 개선 후 노출 예정 */}
      <AnimatePresence>
        {false && showExport && (
          <ExportModal
            recipientName={room?.recipient_name ?? ''}
            messages={messages}
            meadowRef={meadowRef}
            listRef={listRef}
            onClose={() => setShowExport(false)}
          />
        )}
      </AnimatePresence>

      {/* 작성 링크 공유 모달 (참여자용 '더 많은 마음 모으기') */}
      {showShare && room && (
        <ShareModal
          title={`${room.recipient_name}${room.recipient_name.endsWith('님') ? '께' : '님께'} 보내는 롤링페이퍼`}
          description="한 마디 남겨주세요 🌿"
          url={`${window.location.origin}/r/${slug}`}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  )
}
