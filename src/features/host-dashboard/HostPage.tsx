import { useCallback, useEffect, useRef, useState, startTransition } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import bcrypt from 'bcryptjs'
import { supabase } from '../../lib/supabase'
import { removeMyRoom } from '../../lib/myRooms'
import { celebrateConfetti, initConfetti } from '../../lib/celebrateConfetti'
import { trackEvent } from '../../lib/analytics'
import { getStoredAuthorsList, type StoredAuthor } from '../message-write/utils'
import WrapModal from '../gift-wrap/WrapModal'
import ShareModal from '../../components/ShareModal'
import MeadowView from '../viewer/MeadowView'
import MessageModal from '../viewer/MessageModal'
import ListMode from '../viewer/ListMode'

// 스토리지 키 헬퍼 — slug별로 안정적으로 같은 키를 생성한다.
const sessionKey  = (slug: string) => `rp_host_${slug}`
const attemptsKey = (slug: string) => `rp_host_attempts_${slug}`
const lockoutKey  = (slug: string) => `rp_host_lockout_${slug}`

// ─── 타입 ────────────────────────────────────────────────────────────────────
interface Room {
  id: string; recipient_name: string; host_name: string
  host_pin_hash: string; status: string; open_key: string; expires_at?: string
}
interface Message { id: string; author_name: string; shape: string; created_at: string; body: string }
type HostView = 'loading' | 'error' | 'auth' | 'dashboard'

const MAX_ATTEMPTS = 5
const LOCKOUT_MS   = 10 * 60 * 1000

/** 만료까지 남은 일수 계산 */
function daysUntilExpiry(expiresAt?: string): number | null {
  if (!expiresAt) return null
  const ms = new Date(expiresAt).getTime() - Date.now()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

/** 만료 임박 안내 — 시트 내부에 노출 */
function ExpiryNotice({ expiresAt }: { expiresAt?: string }) {
  const days = daysUntilExpiry(expiresAt)
  if (days === null || days > 14) return null
  const urgent = days <= 7
  return (
    <div className={`rounded-2xl px-4 py-3.5 flex items-start gap-3
      ${urgent ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
      <span className="text-xl">{urgent ? '⚠️' : '🕐'}</span>
      <div>
        <p className={`text-[13px] font-bold ${urgent ? 'text-red-700' : 'text-amber-700'}`}>
          {days <= 0 ? '오늘 만료예정이에요!' : `${days}일 후 사라져요`}
        </p>
        <p className={`text-[12px] mt-0.5 ${urgent ? 'text-red-600/70' : 'text-amber-600/70'}`}>
          받는 분께 빨리 전달하거나 이미지로 저장해주세요.
        </p>
      </div>
    </div>
  )
}


export default function HostPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const [view, setView]         = useState<HostView>('loading')
  const [room, setRoom]         = useState<Room | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [errorMsg, setErrorMsg] = useState('')

  const [pin, setPin]             = useState('')
  const [pinError, setPinError]   = useState('')
  const [attempts, setAttempts]   = useState(0)
  const [lockoutUntil, setLockoutUntil] = useState(0)
  const [isVerifying, setIsVerifying]   = useState(false)

  // 풀숲/리스트 뷰 + 만든이 본인이 작성한 꽃 식별
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [isListMode, setIsListMode]   = useState(false)
  const [storedList, setStoredList] = useState<StoredAuthor[]>([])

  // 모달 상태
  const [showManage, setShowManage] = useState(false)
  const [showWrap, setShowWrap]     = useState(false)
  const [isWrapping, setIsWrapping] = useState(false)
  const [openKey, setOpenKey]       = useState('')
  const [showShareWrite, setShowShareWrite] = useState(false)  // 작성 링크 공유
  const [showShareOpen, setShowShareOpen]   = useState(false)  // 열람 링크 공유

  // 이미지 저장용 ref — forwardRef로 MeadowView/ListMode root에 직접 부착
  const meadowRef = useRef<HTMLDivElement>(null)
  const listRef   = useRef<HTMLElement>(null)

  // 컨페티 캔버스 미리 초기화 — 포장 완료 시 지연 없이 즉시 실행
  useEffect(() => { initConfetti() }, [])

  // 메시지 로더 — 시간 오름차순(풀숲 뷰의 자연스러운 등장 순서와 일치)
  const loadMessages = useCallback(async (roomId: string) => {
    const { data } = await supabase.from('messages')
      .select('id, author_name, shape, created_at, body')
      .eq('room_id', roomId).order('created_at', { ascending: true })
    if (data) setMessages(data)
  }, [])

  useEffect(() => {
    if (!slug) return
    setAttempts(parseInt(localStorage.getItem(attemptsKey(slug)) ?? '0'))
    setLockoutUntil(parseInt(localStorage.getItem(lockoutKey(slug)) ?? '0'))

    supabase.from('rooms')
      .select('id, recipient_name, host_name, host_pin_hash, status, open_key, expires_at')
      .eq('slug', slug).single()
      .then(({ data, error }) => {
        if (error || !data) { setErrorMsg('존재하지 않는 롤링페이퍼예요.'); setView('error'); return }
        setRoom(data)
        // 만든이 본인이 작성자일 수도 있음 → 자기 꽃 강조용
        setStoredList(getStoredAuthorsList(slug))
        if (sessionStorage.getItem(sessionKey(slug)) === 'ok') {
          loadMessages(data.id)
          setView('dashboard')
        } else {
          setView('auth')
        }
      })
  }, [slug, loadMessages])

  async function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!room || !slug) return
    if (Date.now() < lockoutUntil) {
      setPinError(`${Math.ceil((lockoutUntil - Date.now()) / 60000)}분 후에 다시 시도해주세요.`); return
    }
    setIsVerifying(true)
    try {
      const ok = await bcrypt.compare(pin, room.host_pin_hash)
      if (ok) {
        localStorage.removeItem(attemptsKey(slug)); localStorage.removeItem(lockoutKey(slug))
        sessionStorage.setItem(sessionKey(slug), 'ok')
        await loadMessages(room.id); setView('dashboard')
      } else {
        const next = attempts + 1
        setAttempts(next); localStorage.setItem(attemptsKey(slug), String(next))
        if (next >= MAX_ATTEMPTS) {
          const until = Date.now() + LOCKOUT_MS
          setLockoutUntil(until); localStorage.setItem(lockoutKey(slug), String(until))
          setPinError('5회 실패로 10분간 잠겼어요.')
        } else { setPinError(`비밀번호가 틀렸어요. (${next}/${MAX_ATTEMPTS})`) }
        setPin('')
      }
    } finally { setIsVerifying(false) }
  }

  async function handleDeleteMsg(id: string) {
    const { error } = await supabase.from('messages').delete().eq('id', id)
    if (!error) {
      setMessages(prev => prev.filter(m => m.id !== id))
      // 모달이 열려 있던 경우 닫기
      setSelectedIdx(null)
    }
  }

  async function handleDeleteRoom() {
    if (!slug) return
    try {
      const { error } = await supabase.rpc('delete_room', { p_slug: slug })
      if (error) throw error
      // 로컬 데이터 정리 후 메인으로 이동
      sessionStorage.removeItem(sessionKey(slug))
      localStorage.removeItem(attemptsKey(slug))
      localStorage.removeItem(lockoutKey(slug))
      removeMyRoom(slug)   // 홈 목록에서도 제거
      navigate('/create', { replace: true, state: { deleted: true } })
    } catch (err) {
      console.error('삭제 오류:', err)
      alert('삭제 중 오류가 발생했어요. 다시 시도해주세요.')
    }
  }

  async function handleWrap() {
    setIsWrapping(true)
    try {
      const { data, error } = await supabase.rpc('wrap_room', { p_slug: slug })
      if (error) throw error
      setOpenKey(data)
      // room.status를 wrapped로 갱신 → 시트의 액션이 자동으로 열람 링크 공유로 전환
      setRoom(prev => prev ? { ...prev, status: 'wrapped', open_key: data } : null)
      setShowWrap(false)
      trackEvent('gift_wrapped', { slug })
      // confetti 먼저 실행 후, 모달 렌더는 낮은 우선순위로 처리 (rAF 차단 방지)
      celebrateConfetti()
      startTransition(() => setShowManage(true))
    } catch (err) {
      console.error('포장 오류:', err); alert('포장 중 오류가 발생했어요.')
    } finally { setIsWrapping(false) }
  }


  const name         = room?.recipient_name ?? ''
  const honorific    = name.endsWith('님') ? '께' : '님께'
  const writeUrl     = `${window.location.origin}/r/${slug}`
  const resolvedKey  = openKey || room?.open_key || ''
  const openUrl      = `${window.location.origin}/r/${slug}/open?k=${resolvedKey}`
  const isWrapped    = room?.status === 'wrapped'

  // ─── 로딩 / 에러 ─────────────────────────────────────────────────────────
  if (view === 'loading') return (
    <main className="min-h-dvh bg-white flex items-center justify-center">
      <span className="text-3xl animate-pulse">🌿</span>
    </main>
  )
  if (view === 'error') return (
    <main className="min-h-dvh bg-white flex items-center justify-center px-5">
      <div className="text-center"><p className="text-4xl mb-4">🍃</p><p className="text-[15px] text-black/60">{errorMsg}</p></div>
    </main>
  )

  // ─── PIN 인증 ─────────────────────────────────────────────────────────────
  if (view === 'auth') return (
    <main className="min-h-dvh bg-white flex items-start justify-center px-5 py-14">
      <div className="w-full max-w-md">
        <h1 className="text-[2.2rem] font-black text-black leading-[1.15] tracking-tight mb-2">
          만든이로<br />입장하기
        </h1>
        <p className="text-black/40 text-[14px] mb-8">방 만들 때 설정한 비밀번호를 입력하세요</p>
        <form onSubmit={handlePinSubmit} className="space-y-4">
          <input
            type="password" inputMode="numeric" value={pin}
            onChange={e => { setPin(e.target.value.replace(/\D/g, '').slice(0, 6)); setPinError('') }}
            placeholder="비밀번호 6자리"
            className="w-full px-4 py-3.5 rounded-xl text-[15px] tracking-widest
                       bg-[#f5f5f5] placeholder:tracking-normal placeholder:text-[13px] placeholder:text-black/20
                       border-2 border-transparent focus:outline-none focus:bg-white focus:border-black/10"
          />
          {pinError && <p className="text-[12px] text-red-500">{pinError}</p>}
          <button type="submit" disabled={isVerifying || pin.length < 6 || Date.now() < lockoutUntil}
            className="w-full py-4 bg-black text-white font-bold text-[15px] rounded-full disabled:opacity-40">
            {isVerifying ? '확인 중...' : '입장'}
          </button>
        </form>
      </div>
    </main>
  )

  // ─── 대시보드 — 풀숲 메인 + 만든이 관리 시트 ─────────────────────────────
  // 리스트 모드 — 만든이는 onDelete로 메시지 삭제 가능
  if (isListMode) {
    return (
      <>
        <ListMode
          ref={listRef}
          messages={messages}
          recipientName={name}
          onClose={() => setIsListMode(false)}
          onDelete={handleDeleteMsg}
          myMessageIds={storedList.map(s => s.messageId)}
          onEdit={(messageId) => navigate(`/r/${slug}`, { state: { editMessageId: messageId } })}
        />
        <HostControls
          isWrapped={isWrapped}
          onOpenManage={() => setShowManage(true)}
        />
        {renderModals()}
      </>
    )
  }

  // 풀숲 메인 뷰
  return (
    <>
      {/* 상단 브랜드 워드마크 */}
      <button
        type="button"
        data-export-hide
        onClick={() => navigate('/create')}
        aria-label="홈으로"
        className="fixed top-0 inset-x-0 z-10 flex justify-center pt-3"
      >
        <p className="text-[10px] font-light tracking-[0.2em] text-black/20 select-none">
          Rolling paper&nbsp;&nbsp;|&nbsp;&nbsp;Pium
        </p>
      </button>

      <MeadowView
        ref={meadowRef}
        messages={messages}
        recipientName={name}
        onFlowerClick={setSelectedIdx}
        onListMode={() => setIsListMode(true)}
        myMessageIds={storedList.map(s => s.messageId)}
      />

      {/* 마음 더 모으기 — 포장 전 주최자에게 항상 노출 */}
      {!isWrapped && (
        <button
          onClick={() => setShowShareWrite(true)}
          data-export-hide
          className="fixed bottom-5 right-5 z-20 flex items-center gap-2
                     px-4 py-2.5 bg-[#5cb054] hover:bg-[#4a9543] rounded-full shadow-lg
                     text-[13px] font-bold text-white
                     border border-black/5 transition-all"
        >
          🌿 더 많은 마음 모으기
        </button>
      )}

      {/* 만든이 컨트롤 (관리 FAB) */}
      <HostControls
        isWrapped={isWrapped}
        onOpenManage={() => setShowManage(true)}
      />

      {renderModals()}
    </>
  )

  // ─── 모달/시트 렌더 — 풀숲/리스트 양쪽에서 공유 ─────────────────────────
  function renderModals() {
    return (
      <>
        {/* 메시지 모달 — 만든이는 삭제 권한 + 본인 메시지면 수정도 가능 */}
        <AnimatePresence>
          {selectedIdx !== null && (
            <MessageModal
              messages={messages}
              currentIndex={selectedIdx}
              onNavigate={setSelectedIdx}
              onClose={() => setSelectedIdx(null)}
              onDelete={handleDeleteMsg}
              myMessageIds={storedList.map(s => s.messageId)}
              onEdit={(messageId) => navigate(`/r/${slug}`, { state: { editMessageId: messageId } })}
            />
          )}
        </AnimatePresence>

        {/* 만든이 관리 시트 */}
        <AnimatePresence>
          {showManage && (
            <ManageSheet
              isWrapped={isWrapped}
              expiresAt={room?.expires_at}
              onClose={() => setShowManage(false)}
              onWriteSelf={() => navigate(`/r/${slug}`)}
              onShareWrite={() => { setShowManage(false); setShowShareWrite(true) }}
              onShareOpen={() => { setShowManage(false); setShowShareOpen(true) }}
              onWrap={() => { setShowManage(false); setShowWrap(true) }}
              onDelete={handleDeleteRoom}
            />
          )}
        </AnimatePresence>

        {/* 포장 확인 모달 */}
        {showWrap && (
          <WrapModal
            recipientName={name}
            onConfirm={handleWrap}
            onCancel={() => setShowWrap(false)}
            isLoading={isWrapping}
          />
        )}

        {/* 작성 링크 공유 — 카카오 / 링크 복사 선택 */}
        {showShareWrite && (
          <ShareModal
            title={`${name}${honorific} 보내는 롤링페이퍼`}
            description="한 마디 남겨주세요 🌿"
            url={writeUrl}
            onClose={() => setShowShareWrite(false)}
          />
        )}

        {/* 열람 링크 공유 — 받는 분께 전달 */}
        {showShareOpen && (
          <ShareModal
            title={`${name}${honorific} 보내는 롤링페이퍼`}
            description="소중한 분들의 마음을 담았어요 🌿"
            url={openUrl}
            onClose={() => setShowShareOpen(false)}
          />
        )}

        {/* 이미지 저장 모달 — 완성도 개선 후 노출 예정 */}
      </>
    )
  }
}

// ─── 만든이 FAB 영역 ────────────────────────────────────────────────────────
interface HostControlsProps {
  isWrapped: boolean
  onOpenManage: () => void
}
function HostControls({ isWrapped, onOpenManage }: HostControlsProps) {
  return (
    <>
      {/* 만든이 관리 진입 — 우하단 톱니 FAB. 우상단은 카운트 배지 자리이므로 충돌 방지 */}
      <button
        onClick={onOpenManage}
        data-export-hide
        className="fixed bottom-[74px] left-5 z-30 w-11 h-11 flex items-center justify-center
                   bg-white/40 hover:bg-white/65 rounded-full
                   shadow-sm border border-white/30
                   text-black/60 hover:text-black/80
                   backdrop-blur-sm transition-all"
        aria-label={isWrapped ? '포장 완료 — 관리 메뉴 열기' : '만든이 관리 메뉴 열기'}
      >
        {/* 설정 아이콘 — Feather settings */}
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>

      {/* 이미지 저장 — 완성도 개선 후 노출 예정 */}
      {/* <button onClick={onOpenExport} data-export-hide ...> 📥 저장 </button> */}
    </>
  )
}

// ─── 만든이 관리 시트 ───────────────────────────────────────────────────────
interface ManageSheetProps {
  isWrapped:    boolean
  expiresAt?:   string
  onClose:      () => void
  onWriteSelf:  () => void
  onShareWrite: () => void
  onShareOpen:  () => void
  onWrap:       () => void
  onDelete:     () => void
}
function ManageSheet({
  isWrapped, expiresAt,
  onClose, onWriteSelf, onShareWrite, onShareOpen, onWrap, onDelete,
}: ManageSheetProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="만든이 관리 메뉴"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="w-full max-w-md bg-white rounded-t-3xl px-5 pt-3 pb-6 max-h-[88dvh] overflow-y-auto"
      >
        {/* 핸들 */}
        <div className="w-10 h-1 bg-black/15 rounded-full mx-auto mb-4" aria-hidden/>

        {/* 헤더 — 타이틀 한 줄만 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-black text-black">
            {isWrapped ? '포장이 완료되었습니다 🎁' : '만든이 관리'}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center
                       text-black/50 hover:text-black rounded-full hover:bg-black/5"
            aria-label="시트 닫기"
          >
            ✕
          </button>
        </div>

        {/* 만료 임박 안내 */}
        <ExpiryNotice expiresAt={expiresAt}/>

        {/* 삭제 확인 화면 */}
        {confirmDelete ? (
          <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-4">
            <p className="text-[13px] font-bold text-red-700 mb-1">정말 삭제할까요?</p>
            <p className="text-[12px] text-red-500/80 mb-4 leading-relaxed">
              롤링페이퍼와 모든 메시지가 영구 삭제돼요. 복구가 불가능해요.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2.5 rounded-full border border-[#d4d4d4]
                           text-[13px] text-black/60 font-semibold"
              >
                취소
              </button>
              <button
                onClick={onDelete}
                className="flex-1 py-2.5 rounded-full bg-red-500 hover:bg-red-600
                           text-white text-[13px] font-bold transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        ) : null}

        {/* 액션 영역 — 포장 전/후로 다르게 */}
        {!confirmDelete && !isWrapped ? (
          <>
            {/* 미포장 — 작성 링크 공유 + 메시지 작성 */}
            <div className="mt-4 space-y-2.5">
              <button
                onClick={onShareWrite}
                className="w-full py-3 bg-black hover:bg-black/80 text-white text-[14px] font-bold
                           rounded-full transition-colors"
              >
                작성 링크 공유하기
              </button>
              <button
                onClick={onWriteSelf}
                className="w-full py-3 border border-[#d4d4d4] hover:border-black
                           bg-white text-black/80 hover:text-black text-[14px] font-semibold
                           rounded-full transition-colors"
              >
                메시지 작성하기
              </button>
            </div>

            {/* 포장 액션 — 분리된 영역 */}
            <div className="mt-5 pt-5 border-t border-black/5">
              <p className="text-[12px] text-black/40 mb-3 leading-relaxed">
                준비가 되면 받는 분께 열람 링크를 보낼 수 있도록 포장해주세요.
              </p>
              <button
                onClick={onWrap}
                className="w-full py-3 bg-[#5cb054] hover:bg-[#4a9543] text-white text-[14px] font-bold
                           rounded-full transition-colors flex items-center justify-center gap-2"
              >
                📜 롤링페이퍼 포장하기
              </button>
            </div>
          </>
        ) : null}

        {/* 포장 완료 — 전달 + 작성 링크 공유 + 메시지 작성 */}
        {!confirmDelete && isWrapped && (
          <div className="mt-4 space-y-2.5">
            <button
              onClick={onShareOpen}
              className="w-full py-3 bg-black hover:bg-black/80 text-white text-[14px] font-bold
                         rounded-full transition-colors"
            >
              롤링페이퍼 전달하기
            </button>
            <button
              onClick={onShareWrite}
              className="w-full py-3 border border-[#d4d4d4] hover:border-black
                         bg-white text-black/80 hover:text-black text-[14px] font-semibold
                         rounded-full transition-colors"
            >
              작성 링크 공유하기
            </button>
            <button
              onClick={onWriteSelf}
              className="w-full py-3 border border-[#d4d4d4] hover:border-black
                         bg-white text-black/80 hover:text-black text-[14px] font-semibold
                         rounded-full transition-colors"
            >
              메시지 작성하기
            </button>
          </div>
        )}

        {/* 롤링페이퍼 삭제 — 하단 위험 영역 */}
        {!confirmDelete && (
          <div className="mt-6 pt-5 border-t border-black/5 text-center">
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-[12px] text-black/30 hover:text-red-500 transition-colors"
            >
              롤링페이퍼 삭제
            </button>
          </div>
        )}

      </motion.div>
    </motion.div>
  )
}
