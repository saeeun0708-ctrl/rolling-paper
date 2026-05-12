import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import bcrypt from 'bcryptjs'
import { supabase } from '../../lib/supabase'
import { shareKakao } from '../../lib/kakao'
import { FlowerShape, FLOWER_EMOJIS } from '../message-write/utils'
import WrapModal from '../gift-wrap/WrapModal'
import ShareModal from '../../components/ShareModal'
import Footer from '../../components/Footer'

// ─── 타입 ────────────────────────────────────────────────────────────────────
interface Room {
  id: string; recipient_name: string; host_name: string
  host_pin_hash: string; status: string; open_key: string; expires_at?: string
}

/** 만료까지 남은 일수 계산 */
function daysUntilExpiry(expiresAt?: string): number | null {
  if (!expiresAt) return null
  const ms = new Date(expiresAt).getTime() - Date.now()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

/** 삭제 예정 경고 배너 */
function ExpiryBanner({ expiresAt }: { expiresAt?: string }) {
  const days = daysUntilExpiry(expiresAt)
  if (days === null || days > 14) return null
  const urgent = days <= 7
  return (
    <div className={`rounded-2xl px-4 py-3.5 mb-4 flex items-start gap-3
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
interface Message { id: string; author_name: string; shape: string; created_at: string; body: string }
type HostView = 'loading' | 'error' | 'auth' | 'dashboard' | 'wrapped'

const MAX_ATTEMPTS = 5
const LOCKOUT_MS   = 10 * 60 * 1000

function fmtTime(d: string) {
  const m = Math.floor((Date.now() - +new Date(d)) / 60000)
  if (m < 1)  return '방금 전'
  if (m < 60) return `${m}분 전`
  if (m < 1440) return `${Math.floor(m / 60)}시간 전`
  return `${Math.floor(m / 1440)}일 전`
}

/** URL에서 open_key 값을 ****로 마스킹 (화면 표시용) */
function maskUrl(url: string) {
  return url.replace(/k=.+$/, 'k=••••••••')
}

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
  alert('복사됐어요!')
}

export default function HostPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const SESSION_KEY  = `rp_host_${slug}`
  const ATTEMPTS_KEY = `rp_host_attempts_${slug}`
  const LOCKOUT_KEY  = `rp_host_lockout_${slug}`

  const [view, setView]         = useState<HostView>('loading')
  const [room, setRoom]         = useState<Room | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [errorMsg, setErrorMsg] = useState('')

  const [pin, setPin]             = useState('')
  const [pinError, setPinError]   = useState('')
  const [attempts, setAttempts]   = useState(0)
  const [lockoutUntil, setLockoutUntil] = useState(0)
  const [isVerifying, setIsVerifying]   = useState(false)

  const [showWrap, setShowWrap]     = useState(false)
  const [isWrapping, setIsWrapping] = useState(false)
  const [openKey, setOpenKey]       = useState('')
  // 미포장 상태에서 '링크 공유하기' 클릭 시 공유 방법 선택 모달 노출
  const [showShare, setShowShare]   = useState(false)

  useEffect(() => {
    if (!slug) return
    setAttempts(parseInt(localStorage.getItem(ATTEMPTS_KEY) ?? '0'))
    setLockoutUntil(parseInt(localStorage.getItem(LOCKOUT_KEY) ?? '0'))

    supabase.from('rooms')
      .select('id, recipient_name, host_name, host_pin_hash, status, open_key, expires_at')
      .eq('slug', slug).single()
      .then(({ data, error }) => {
        if (error || !data) { setErrorMsg('존재하지 않는 롤링페이퍼예요.'); setView('error'); return }
        setRoom(data)
        if (sessionStorage.getItem(SESSION_KEY) === 'ok') { loadMessages(data.id); setView('dashboard') }
        else setView('auth')
      })
  }, [slug])

  async function loadMessages(roomId: string) {
    const { data } = await supabase.from('messages')
      .select('id, author_name, shape, created_at, body')
      .eq('room_id', roomId).order('created_at', { ascending: false })
    if (data) setMessages(data)
  }

  async function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!room) return
    if (Date.now() < lockoutUntil) {
      setPinError(`${Math.ceil((lockoutUntil - Date.now()) / 60000)}분 후에 다시 시도해주세요.`); return
    }
    setIsVerifying(true)
    try {
      const ok = await bcrypt.compare(pin, room.host_pin_hash)
      if (ok) {
        localStorage.removeItem(ATTEMPTS_KEY); localStorage.removeItem(LOCKOUT_KEY)
        sessionStorage.setItem(SESSION_KEY, 'ok')
        await loadMessages(room.id); setView('dashboard')
      } else {
        const next = attempts + 1
        setAttempts(next); localStorage.setItem(ATTEMPTS_KEY, String(next))
        if (next >= MAX_ATTEMPTS) {
          const until = Date.now() + LOCKOUT_MS
          setLockoutUntil(until); localStorage.setItem(LOCKOUT_KEY, String(until))
          setPinError('5회 실패로 10분간 잠겼어요.')
        } else { setPinError(`비밀번호가 틀렸어요. (${next}/${MAX_ATTEMPTS})`) }
        setPin('')
      }
    } finally { setIsVerifying(false) }
  }

  async function handleDeleteMsg(id: string) {
    if (!window.confirm('이 메시지를 삭제할까요?')) return
    const { error } = await supabase.from('messages').delete().eq('id', id)
    if (!error) setMessages(prev => prev.filter(m => m.id !== id))
  }

  async function handleWrap() {
    setIsWrapping(true)
    try {
      const { data, error } = await supabase.rpc('wrap_room', { p_slug: slug })
      if (error) throw error
      setOpenKey(data); setShowWrap(false); setView('wrapped')
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
        <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-black/30 mb-5">Maker Access</p>
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

  // ─── 포장 완료 화면 ───────────────────────────────────────────────────────
  if (view === 'wrapped') return (
    <main className="min-h-dvh bg-white flex items-start justify-center px-5 py-14">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📜</div>
          <h1 className="text-[2rem] font-black text-black leading-tight mb-2">포장이 완료됐어요!</h1>
          <p className="text-black/40 text-[14px]">{name}님께 아래 열람 링크를 전달해주세요</p>
        </div>
        <div className="rounded-2xl bg-[#dceeb1] px-5 py-4 mb-4">
          <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-black/50 mb-1.5">열람 링크</p>
          <p className="text-[13px] text-black/60 break-all">{maskUrl(openUrl)}</p>
        </div>
        <div className="space-y-2.5">
          <button onClick={() => shareKakao(`${name}${honorific} 보내는 롤링페이퍼`, '소중한 분들의 마음을 담았어요 🌿', openUrl)}
            className="w-full py-[10px] bg-[#FEE500] text-[#3c1e1e] font-bold text-[15px] rounded-full">
            카카오로 공유
          </button>
          <button onClick={() => copyToClipboard(openUrl)}
            className="w-full py-[10px] bg-black text-white font-bold text-[15px] rounded-full">
            열람 링크 복사
          </button>
          <button onClick={() => setView('dashboard')}
            className="w-full py-[10px] border border-[#e6e6e6] text-black text-[15px] rounded-full">
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    </main>
  )

  // ─── 대시보드 ─────────────────────────────────────────────────────────────
  return (
    <>
      <main className="min-h-dvh bg-white px-5 py-12">
        <div className="w-full max-w-md mx-auto space-y-6">

          {/* 만료 배너 */}
          <ExpiryBanner expiresAt={room?.expires_at}/>

          {/* 헤더 */}
          <div>
            <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-black/30 mb-3">Dashboard</p>
            <h1 className="text-[2rem] font-black text-black leading-tight mb-1">
              <span className="text-[#5cb054]">{name}</span>{honorific} 롤링페이퍼
            </h1>
            <p className="text-black/40 text-[14px]">{messages.length}명이 마음을 남겼어요</p>
          </div>

          {/* ① 참여자 초대 — 메시지 작성하기(보조) + 링크 공유하기(1순위) */}
          {!isWrapped && (
            <div className="rounded-2xl border border-[#e6e6e6] px-5 py-4">
              <p className="text-[11px] font-mono uppercase tracking-[0.1em] text-black/40 mb-3">
                참여자 초대
              </p>
              <div className="flex gap-2">
                {/* 만든이 본인도 자기 폰에서 바로 메시지를 남길 수 있게 — 보조 액션 */}
                <button
                  onClick={() => navigate(`/r/${slug}`)}
                  className="flex-1 py-2.5 bg-white border border-[#d4d4d4]
                             hover:border-black hover:text-black
                             text-black/70 text-[13px] font-semibold
                             rounded-full transition-colors"
                >
                  메시지 작성하기
                </button>
                {/* 공유 방법(카카오 / 링크 복사) 선택 모달 — 1순위 */}
                <button
                  onClick={() => setShowShare(true)}
                  className="flex-1 py-2.5 bg-black hover:bg-black/80
                             text-white text-[13px] font-bold
                             rounded-full transition-colors"
                >
                  링크 공유하기
                </button>
              </div>
            </div>
          )}

          {/* ② 메시지 목록 */}
          <div className="space-y-3">
            {/* 메시지가 있을 때만 받는 분 화면 미리보기 진입 링크 노출 */}
            {messages.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-black/40">
                  메시지
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/r/${slug}/preview`)}
                  className="text-[12px] font-semibold text-black/60 hover:text-black
                             transition-colors"
                >
                  받는 분 화면으로 보기 →
                </button>
              </div>
            )}
            {messages.length === 0
              ? <p className="text-center py-8 text-black/30 text-[14px]">아직 작성된 메시지가 없어요</p>
              : messages.map(msg => {
                  const shape = msg.shape as FlowerShape
                  return (
                    <div key={msg.id} className="rounded-2xl bg-[#f5f5f5] px-4 py-3.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{FLOWER_EMOJIS[shape] ?? '🌸'}</span>
                          <span className="text-[13px] font-bold text-black">{msg.author_name}</span>
                          <span className="text-[11px] text-black/30">{fmtTime(msg.created_at)}</span>
                        </div>
                        <button onClick={() => handleDeleteMsg(msg.id)}
                          className="text-[11px] text-black/30 hover:text-red-500 transition-colors">
                          삭제
                        </button>
                      </div>
                      <p className="text-[13px] text-black/60 line-clamp-2 leading-relaxed">{msg.body}</p>
                    </div>
                  )
                })
            }
          </div>

          {/* ③ 포장 / 열람 링크 섹션 */}
          {isWrapped ? (
            /* 포장 완료 — 링크 전달 버튼만 표시 (URL 비노출) */
            <div className="rounded-2xl bg-[#dceeb1] px-5 py-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-black text-white text-[11px] font-bold rounded-full">
                  포장 완료
                </span>
              </div>
              <p className="text-[14px] font-bold text-black">
                {name}님께 열람 링크를 전달하세요
              </p>
              <p className="text-[12px] text-black/50">
                링크를 받으면 모든 메시지를 볼 수 있어요
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => shareKakao(`${name}${honorific} 보내는 롤링페이퍼`, '소중한 분들의 마음을 담았어요 🌿', openUrl)}
                  className="flex-1 py-3 bg-[#FEE500] text-[#3c1e1e] text-[13px] font-bold rounded-full"
                >
                  카카오로 공유
                </button>
                <button
                  onClick={() => copyToClipboard(openUrl)}
                  className="flex-1 py-3 bg-black text-white text-[13px] font-bold rounded-full"
                >
                  링크 복사
                </button>
              </div>
            </div>
          ) : (
            /* 미포장 — 포장하기 버튼 */
            <div className="rounded-2xl border border-[#e6e6e6] px-5 py-5">
              <p className="text-[12px] text-black/40 mb-4 text-center leading-relaxed">
                포장하면 더 이상 새 메시지를 받지 않고,<br />받는 분께 보낼 열람 링크가 만들어져요
              </p>
              <button onClick={() => setShowWrap(true)}
                className="w-full py-4 bg-black text-white font-bold text-[15px] rounded-full">
                📜 롤링페이퍼 포장하기
              </button>
            </div>
          )}
        </div>
        <Footer className="mt-8" light/>
      </main>

      {showWrap && (
        <WrapModal
          recipientName={name}
          onConfirm={handleWrap}
          onCancel={() => setShowWrap(false)}
          isLoading={isWrapping}
        />
      )}

      {showShare && (
        <ShareModal
          title={`${name}${honorific} 롤링페이퍼`}
          description="마음을 남겨주세요 🌿"
          url={writeUrl}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  )
}
