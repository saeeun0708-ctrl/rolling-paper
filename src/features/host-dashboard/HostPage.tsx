import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import bcrypt from 'bcryptjs'
import { supabase } from '../../lib/supabase'
import { getStoredAuthor, type StoredAuthor } from '../message-write/utils'
import WrapModal from '../gift-wrap/WrapModal'
import ShareModal from '../../components/ShareModal'
import MeadowView from '../viewer/MeadowView'
import MessageModal from '../viewer/MessageModal'
import ListMode from '../viewer/ListMode'
import ExportModal from '../image-export/ExportModal'

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

/** URL에서 open_key 값을 ****로 마스킹 (시트 내 미리보기용) */
function maskUrl(url: string) {
  return url.replace(/k=.+$/, 'k=••••••••')
}

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

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    alert('복사됐어요!')
  } catch {
    alert(`링크를 직접 복사해주세요:\n${text}`)
  }
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
  const [storedAuthor, setStoredAuthor] = useState<StoredAuthor | null>(null)

  // 모달 상태
  const [showManage, setShowManage] = useState(false)
  const [showWrap, setShowWrap]     = useState(false)
  const [isWrapping, setIsWrapping] = useState(false)
  const [openKey, setOpenKey]       = useState('')
  const [showShareWrite, setShowShareWrite] = useState(false)  // 작성 링크 공유
  const [showShareOpen, setShowShareOpen]   = useState(false)  // 열람 링크 공유
  const [showExport, setShowExport]         = useState(false)

  // 이미지 저장용 ref (풀숲/리스트)
  const meadowRef = useRef<HTMLDivElement>(null)
  const listRef   = useRef<HTMLDivElement>(null)

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
        setStoredAuthor(getStoredAuthor(slug))
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

  async function handleWrap() {
    setIsWrapping(true)
    try {
      const { data, error } = await supabase.rpc('wrap_room', { p_slug: slug })
      if (error) throw error
      setOpenKey(data)
      // room.status를 wrapped로 갱신 → 시트의 액션이 자동으로 열람 링크 공유로 전환
      setRoom(prev => prev ? { ...prev, status: 'wrapped', open_key: data } : null)
      setShowWrap(false)
      // 포장 직후 사용자가 즉시 열람 링크를 공유할 수 있도록 안내 시트를 자동으로 띄움
      setShowManage(true)
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
                       bg-[#f5f5f5] placeholder:tracking-normal placeholder:text-black/25
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
  // 리스트 모드
  if (isListMode) {
    return (
      <>
        <div ref={listRef}>
          <ListMode
            messages={messages}
            recipientName={name}
            onClose={() => setIsListMode(false)}
          />
        </div>
        <HostControls
          isWrapped={isWrapped}
          onOpenManage={() => setShowManage(true)}
          onOpenExport={() => setShowExport(true)}
        />
        {renderModals()}
      </>
    )
  }

  // 풀숲 메인 뷰
  return (
    <>
      <div ref={meadowRef}>
        <MeadowView
          messages={messages}
          recipientName={name}
          onFlowerClick={setSelectedIdx}
          onListMode={() => setIsListMode(true)}
          myMessageId={storedAuthor?.messageId}
        />
      </div>

      {/* 만든이 컨트롤 (관리 / 이미지 저장 FAB) */}
      <HostControls
        isWrapped={isWrapped}
        onOpenManage={() => setShowManage(true)}
        onOpenExport={() => setShowExport(true)}
      />

      {renderModals()}
    </>
  )

  // ─── 모달/시트 렌더 — 풀숲/리스트 양쪽에서 공유 ─────────────────────────
  function renderModals() {
    return (
      <>
        {/* 메시지 모달 — 만든이는 삭제 권한 노출 */}
        <AnimatePresence>
          {selectedIdx !== null && (
            <MessageModal
              messages={messages}
              currentIndex={selectedIdx}
              onNavigate={setSelectedIdx}
              onClose={() => setSelectedIdx(null)}
              onDelete={handleDeleteMsg}
            />
          )}
        </AnimatePresence>

        {/* 만든이 관리 시트 */}
        <AnimatePresence>
          {showManage && (
            <ManageSheet
              name={name}
              honorific={honorific}
              isWrapped={isWrapped}
              messages={messages}
              openUrl={openUrl}
              expiresAt={room?.expires_at}
              onClose={() => setShowManage(false)}
              onWriteSelf={() => navigate(`/r/${slug}`)}
              onShareWrite={() => { setShowManage(false); setShowShareWrite(true) }}
              onShareOpen={() => { setShowManage(false); setShowShareOpen(true) }}
              onCopyOpen={() => copyToClipboard(openUrl)}
              onWrap={() => { setShowManage(false); setShowWrap(true) }}
              onListMode={() => { setShowManage(false); setIsListMode(true) }}
              onDeleteMessage={handleDeleteMsg}
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

        {/* 이미지 저장 모달 */}
        <AnimatePresence>
          {showExport && (
            <ExportModal
              recipientName={name}
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
}

// ─── 만든이 FAB 영역 ────────────────────────────────────────────────────────
interface HostControlsProps {
  isWrapped: boolean
  onOpenManage: () => void
  onOpenExport: () => void
}
function HostControls({ isWrapped, onOpenManage, onOpenExport }: HostControlsProps) {
  return (
    <>
      {/* 만든이 관리 진입 — 우상단 톱니 FAB (라벨은 시트 내부에서 노출) */}
      <button
        onClick={onOpenManage}
        data-export-hide
        className="fixed top-5 right-5 z-30 w-11 h-11 flex items-center justify-center
                   bg-white/95 hover:bg-white rounded-full shadow-lg
                   text-[20px]
                   border border-black/10 backdrop-blur-sm transition-all"
        aria-label={isWrapped ? '포장 완료 — 관리 메뉴 열기' : '만든이 관리 메뉴 열기'}
      >
        <span aria-hidden>⚙️</span>
      </button>

      {/* 이미지 저장 — 우하단 */}
      <button
        onClick={onOpenExport}
        data-export-hide
        className="fixed bottom-20 right-5 z-20 flex items-center gap-2
                   px-4 py-2.5 bg-white/90 rounded-full shadow-lg
                   text-[13px] font-bold text-black/70 hover:text-black
                   border border-black/10 backdrop-blur-sm transition-all"
      >
        📥 저장
      </button>
    </>
  )
}

// ─── 만든이 관리 시트 ───────────────────────────────────────────────────────
interface ManageSheetProps {
  name:           string
  honorific:      string
  isWrapped:      boolean
  messages:       Message[]
  openUrl:        string
  expiresAt?:     string
  onClose:        () => void
  onWriteSelf:    () => void
  onShareWrite:   () => void
  onShareOpen:    () => void
  onCopyOpen:     () => void
  onWrap:         () => void
  onListMode:     () => void
  onDeleteMessage:(id: string) => void
}
function ManageSheet({
  name, honorific, isWrapped, messages, openUrl, expiresAt,
  onClose, onWriteSelf, onShareWrite, onShareOpen, onCopyOpen, onWrap, onListMode, onDeleteMessage,
}: ManageSheetProps) {
  // 호이스팅된 부수 정보를 시트 안에서 그대로 사용. 화면을 가린 채로 컨트롤만 모은다.
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

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.1em] text-black/40">
              {isWrapped ? '포장 완료' : '만든이 관리'}
            </p>
            <h2 className="text-[18px] font-black text-black mt-0.5">
              {name}{honorific} 롤링페이퍼
            </h2>
            <p className="text-[12px] text-black/40 mt-0.5">{messages.length}명이 마음을 남겼어요</p>
          </div>
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

        {/* 액션 영역 — 포장 전/후로 다르게 */}
        {!isWrapped ? (
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
                나도 한 마디 남기기
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
        ) : (
          <>
            {/* 포장 완료 — 열람 링크 공유 */}
            <div className="mt-4 rounded-2xl bg-[#dceeb1] px-4 py-4 space-y-2">
              <p className="text-[13px] font-bold text-black">
                {name}{honorific} 열람 링크를 전달하세요
              </p>
              <p className="text-[12px] text-black/55">
                링크를 받으면 모든 메시지를 볼 수 있어요
              </p>
              <p className="font-mono text-[11px] text-black/40 break-all pt-1">
                {maskUrl(openUrl)}
              </p>
            </div>

            <div className="mt-3 space-y-2.5">
              <button
                onClick={onShareOpen}
                className="w-full py-3 bg-black hover:bg-black/80 text-white text-[14px] font-bold
                           rounded-full transition-colors"
              >
                열람 링크 공유하기
              </button>
              <button
                onClick={onCopyOpen}
                className="w-full py-3 border border-[#d4d4d4] hover:border-black
                           bg-white text-black/80 hover:text-black text-[14px] font-semibold
                           rounded-full transition-colors"
              >
                열람 링크 복사
              </button>
            </div>
          </>
        )}

        {/* 메시지 빠른 점검 — 리스트 진입 */}
        {messages.length > 0 && (
          <div className="mt-5 pt-5 border-t border-black/5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-mono uppercase tracking-[0.1em] text-black/40">
                메시지 목록
              </p>
              <button
                onClick={onListMode}
                className="text-[12px] font-semibold text-black/55 hover:text-black"
              >
                전체 리스트로 보기 →
              </button>
            </div>
            {/* 간이 미리보기 — 최근 3개 + 삭제 */}
            <ul className="space-y-1.5">
              {messages.slice(-3).reverse().map(msg => (
                <li key={msg.id} className="flex items-center justify-between gap-2 py-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-black truncate">{msg.author_name}</p>
                    <p className="text-[12px] text-black/50 truncate">{msg.body}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm(`${msg.author_name}님의 메시지를 삭제할까요?`)) {
                        onDeleteMessage(msg.id)
                      }
                    }}
                    className="shrink-0 text-[11px] text-black/30 hover:text-red-500 transition-colors"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
            {messages.length > 3 && (
              <p className="text-[11px] text-black/30 mt-2 text-center">
                전체 {messages.length}개 — 모두 보려면 위의 '전체 리스트로 보기'
              </p>
            )}
          </div>
        )}

      </motion.div>
    </motion.div>
  )
}
