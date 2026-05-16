import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { addMyRoom } from '../lib/myRooms'

/** 이메일 형식 간단 검증 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** 검색 결과 카드에 표시할 방 정보 */
interface FoundRoom {
  slug: string
  recipientName: string
  hostName: string
  createdAt: string
}

/** 생성일자를 "오늘", "어제", "n일 전" 형태로 가볍게 포맷 */
function fmtCreated(iso: string): string {
  const created = new Date(iso)
  // 시각 차이가 아닌 로컬 자정 기준 달력일 차이로 계산한다
  // (예: 어제 23:00 생성 → 오늘 01:00 조회를 "오늘"로 잘못 표기하는 문제 방지)
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diffDays = Math.floor((startOfDay(new Date()) - startOfDay(created)) / 86_400_000)
  if (diffDays <= 0) return '오늘'
  if (diffDays === 1) return '어제'
  if (diffDays < 30) return `${diffDays}일 전`
  return `${created.getFullYear()}.${String(created.getMonth() + 1).padStart(2, '0')}.${String(created.getDate()).padStart(2, '0')}`
}

/** 이름 뒤에 붙일 존칭 ("엄마" → "님께", "부모님" → "께") */
function honorificSuffix(name: string): string {
  return name.endsWith('님') ? '께' : '님께'
}

export default function FindMyRoomsPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  // null = 아직 검색 안 함, [] = 검색했으나 결과 없음, [...] = 결과 있음
  const [results, setResults] = useState<FoundRoom[] | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const normalized = email.trim().toLowerCase()
    if (!normalized) {
      setError('이메일을 입력해주세요.')
      return
    }
    if (!EMAIL_RE.test(normalized)) {
      setError('이메일 형식이 올바르지 않아요.')
      return
    }

    setIsLoading(true)
    try {
      // rooms_select_anyone RLS 정책이 SELECT를 허용한다.
      const { data, error: dbErr } = await supabase
        .from('rooms')
        .select('slug, recipient_name, host_name, created_at')
        .eq('host_email', normalized)
        .order('created_at', { ascending: false })
        .limit(50)

      if (dbErr) throw dbErr

      const found: FoundRoom[] = (data ?? []).map(row => ({
        slug:          row.slug,
        recipientName: row.recipient_name,
        hostName:      row.host_name,
        createdAt:     row.created_at,
      }))
      setResults(found)
    } catch (err) {
      console.error('내 방 찾기 오류:', err)
      setError('찾는 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  /** 카드 클릭 — 이 기기 목록에도 등록한 뒤 host 페이지로 이동 */
  function handleOpenRoom(room: FoundRoom) {
    addMyRoom({
      slug:          room.slug,
      recipientName: room.recipientName,
      hostName:      room.hostName,
      createdAt:     room.createdAt,
    })
    navigate(`/r/${room.slug}/host`)
  }

  return (
    <main className="font-legacy min-h-dvh bg-white flex items-start justify-center px-5 py-14">
      <div className="w-full max-w-md">

        {/* 헤딩 — 한 줄 표시 (좁은 화면 안전을 위해 폰트 크기 살짝 축소) */}
        <h1 className="text-[1.85rem] font-black text-black leading-[1.15] tracking-tight mb-2 whitespace-nowrap">
          내 롤링페이퍼 찾기
        </h1>
        <p className="text-black/40 text-[14px] mb-8">
          롤링페이퍼를 만들 때 사용한 이메일을 입력해주세요.
        </p>

        {/* 이메일 입력 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-black/50 mb-1.5">
              이메일
            </label>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              placeholder="example@email.com"
              maxLength={120}
              className={`w-full px-4 py-3.5 rounded-xl text-[15px] text-black
                          bg-[#f5f5f5] placeholder:text-[13px] placeholder:text-black/20
                          border-2 transition-colors
                          focus:outline-none focus:bg-white
                          ${error
                            ? 'border-red-400 bg-red-50'
                            : 'border-transparent focus:border-black/10'}`}
            />
            {error && <p className="mt-1.5 text-[12px] text-red-500">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-black hover:bg-black/80
                       text-white font-bold text-[15px]
                       rounded-full transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" />
                찾는 중...
              </span>
            ) : (
              '찾기'
            )}
          </button>
        </form>

        {/* 검색 결과 */}
        {results !== null && (
          <section className="mt-8">
            {results.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[14px] text-black/50 mb-2">
                  이 이메일로 만든 롤링페이퍼가 없어요.
                </p>
                <p className="text-[12px] text-black/30">
                  방 만들 때 이메일을 입력하지 않으셨거나,<br />
                  다른 이메일을 사용하셨을 수 있어요.
                </p>
              </div>
            ) : (
              <>
                <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-black/40 mb-3">
                  찾은 롤링페이퍼 · {results.length}개
                </p>
                <ul className="space-y-2">
                  {results.map(room => (
                    <li key={room.slug}>
                      <button
                        type="button"
                        onClick={() => handleOpenRoom(room)}
                        className="w-full text-left rounded-2xl bg-[#f5f5f5]
                                   hover:bg-[#eeeeee] transition-colors
                                   px-4 py-3.5"
                      >
                        <p className="text-[14px] font-bold text-black truncate">
                          <span className="text-[#5cb054]">{room.recipientName}</span>
                          {honorificSuffix(room.recipientName)}
                        </p>
                        <p className="text-[11px] text-black/40 mt-0.5">
                          {room.hostName} · {fmtCreated(room.createdAt)}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )}

        {/* 새로 만들기로 돌아가기 */}
        <div className="mt-10 pt-6 border-t border-black/5 text-center">
          <Link
            to="/create"
            className="text-[13px] text-black/50 hover:text-black transition-colors"
          >
            ← 새 롤링페이퍼 만들기
          </Link>
        </div>

      </div>
    </main>
  )
}
