import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCreateRoom } from './useCreateRoom'
import { getMyRooms, removeMyRoom, type MyRoom } from '../../lib/myRooms'

/** 생성일자를 "오늘", "어제", "n일 전" 형태로 가볍게 포맷 */
function fmtCreated(iso: string): string {
  const diffDays = Math.floor((Date.now() - +new Date(iso)) / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return '오늘'
  if (diffDays === 1) return '어제'
  if (diffDays < 30) return `${diffDays}일 전`
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

/** 이름 뒤에 붙일 존칭만 반환 ("엄마" → "님께", "부모님" → "께") */
function honorificSuffix(name: string): string {
  return name.endsWith('님') ? '께' : '님께'
}

export default function CreateRoomPage() {
  const { values, errors, isLoading, handleChange, handlePinChange, handleSubmit } = useCreateRoom()
  const navigate = useNavigate()
  const [myRooms, setMyRooms] = useState<MyRoom[]>([])
  // 카드가 있을 땐 폼을 디스클로저로 접어 핵심 동선(기존 방으로 들어가기)에 집중
  const [showForm, setShowForm] = useState(false)

  // 마운트 시 한 번 로컬에 저장된 내 방 목록 로드
  useEffect(() => {
    const list = getMyRooms()
    setMyRooms(list)
    // 저장된 방이 없으면 폼은 처음부터 펼쳐서 보여준다
    setShowForm(list.length === 0)
  }, [])

  /** 이 기기 목록에서 제거 (Supabase 데이터는 그대로 둠) */
  function handleRemoveLocal(slug: string) {
    if (!window.confirm('이 기기 목록에서만 지울게요. 나중에 링크로는 다시 들어갈 수 있어요.')) return
    removeMyRoom(slug)
    const next = getMyRooms()
    setMyRooms(next)
    // 카드를 모두 지웠다면 폼을 자동으로 펼쳐서 다음 행동을 명확히
    if (next.length === 0) setShowForm(true)
  }

  const hasMyRooms = myRooms.length > 0

  return (
    <main className="min-h-dvh bg-white flex items-start justify-center px-5 py-14">
      <div className="w-full max-w-md">

        {/* 아이브로우 */}
        <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-black/30 mb-5">
          Rolling Paper
        </p>

        {/* 헤딩 */}
        <h1 className="text-[2.4rem] font-black text-black leading-[1.15] tracking-[-0.5px] mb-2">
          소중한 분께<br />마음을 모아요
        </h1>
        <p className="text-black/40 text-[15px] mb-10">
          메시지를 모아 특별한 롤링페이퍼를 만들어보세요
        </p>

        {/* 내가 만든 롤링페이퍼 — 같은 기기 재방문자의 핵심 동선 */}
        {hasMyRooms && (
          <section className="mb-8">
            <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-black/40 mb-3">
              내가 만든 롤링페이퍼
            </p>
            <ul className="space-y-2">
              {myRooms.map(room => (
                <li
                  key={room.slug}
                  className="rounded-2xl bg-[#f5f5f5] hover:bg-[#eeeeee] transition-colors
                             flex items-center"
                >
                  {/* 카드 본문 — 클릭 시 host 페이지(PIN 인증)로 이동 */}
                  <button
                    type="button"
                    onClick={() => navigate(`/r/${room.slug}/host`)}
                    className="flex-1 text-left px-4 py-3.5 min-w-0"
                  >
                    <p className="text-[14px] font-bold text-black truncate">
                      <span className="text-[#5cb054]">{room.recipientName}</span>
                      {honorificSuffix(room.recipientName)}
                    </p>
                    <p className="text-[11px] text-black/40 mt-0.5">
                      {room.hostName} · {fmtCreated(room.createdAt)}
                    </p>
                  </button>

                  {/* 이 기기 목록에서만 제거 */}
                  <button
                    type="button"
                    onClick={() => handleRemoveLocal(room.slug)}
                    aria-label="이 기기 목록에서 제거"
                    className="px-3 py-3.5 text-[11px] text-black/30 hover:text-red-500
                               transition-colors"
                  >
                    숨기기
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-black/30 leading-relaxed">
              이 기기에서 만든 롤링페이퍼만 보여요. 비밀번호를 모르면 들어갈 수 없어요.
            </p>
          </section>
        )}

        {/* 새로 만들기 — 카드가 있으면 디스클로저로 접어 시각 위계를 낮춤 */}
        {hasMyRooms && !showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="w-full py-3.5 mt-2 rounded-full border border-[#e6e6e6]
                       text-[13px] font-bold text-black/70
                       hover:border-black hover:text-black transition-colors"
          >
            + 새 롤링페이퍼 만들기
          </button>
        )}

        {/* 폼 */}
        {showForm && (
          <>
            {hasMyRooms && (
              <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-black/40 mt-2 mb-3">
                새로 만들기
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* 받는 분 이름 */}
              <div>
                <label className="block text-[13px] font-medium text-black/50 mb-1.5">
                  받으실 분
                </label>
                <input
                  type="text"
                  value={values.recipientName}
                  onChange={e => handleChange('recipientName', e.target.value)}
                  placeholder="예: 엄마, 아버지, 김선생님"
                  maxLength={30}
                  className={`w-full px-4 py-3.5 rounded-xl text-[15px] text-black
                              bg-[#f5f5f5] placeholder:text-black/25
                              border-2 transition-colors
                              focus:outline-none focus:bg-white
                              ${errors.recipientName
                                ? 'border-red-400 bg-red-50'
                                : 'border-transparent focus:border-black/10'}`}
                />
                {errors.recipientName && (
                  <p className="mt-1.5 text-[12px] text-red-500">{errors.recipientName}</p>
                )}
              </div>

              {/* 만든이 이름 */}
              <div>
                <label className="block text-[13px] font-medium text-black/50 mb-1.5">
                  내 이름
                </label>
                <input
                  type="text"
                  value={values.hostName}
                  onChange={e => handleChange('hostName', e.target.value)}
                  placeholder="예: 큰딸, 홍길동"
                  maxLength={20}
                  className={`w-full px-4 py-3.5 rounded-xl text-[15px] text-black
                              bg-[#f5f5f5] placeholder:text-black/25
                              border-2 transition-colors
                              focus:outline-none focus:bg-white
                              ${errors.hostName
                                ? 'border-red-400 bg-red-50'
                                : 'border-transparent focus:border-black/10'}`}
                />
                {errors.hostName && (
                  <p className="mt-1.5 text-[12px] text-red-500">{errors.hostName}</p>
                )}
              </div>

              {/* 이메일 (선택) — 기기 변경 시 내 방 찾기 키 */}
              <div>
                <label className="block text-[13px] font-medium text-black/50 mb-1.5">
                  이메일 <span className="text-black/30 font-normal">(선택)</span>
                </label>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder="example@email.com"
                  maxLength={120}
                  className={`w-full px-4 py-3.5 rounded-xl text-[15px] text-black
                              bg-[#f5f5f5] placeholder:text-black/25
                              border-2 transition-colors
                              focus:outline-none focus:bg-white
                              ${errors.email
                                ? 'border-red-400 bg-red-50'
                                : 'border-transparent focus:border-black/10'}`}
                />
                <p className="mt-2 text-[12px] text-black/30">
                  이메일을 입력하면 다른 기기에서도 볼 수 있어요.
                </p>
                {errors.email && (
                  <p className="mt-1 text-[12px] text-red-500">{errors.email}</p>
                )}
              </div>

              {/* 관리 PIN */}
              <div>
                <label className="block text-[13px] font-medium text-black/50 mb-1.5">
                  비밀번호
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={values.pin}
                  onChange={e => handlePinChange(e.target.value)}
                  placeholder="숫자 6자리"
                  autoComplete="new-password"
                  className={`w-full px-4 py-3.5 rounded-xl text-[15px] text-black tracking-widest
                              bg-[#f5f5f5] placeholder:text-black/25 placeholder:tracking-normal
                              border-2 transition-colors
                              focus:outline-none focus:bg-white
                              ${errors.pin
                                ? 'border-red-400 bg-red-50'
                                : 'border-transparent focus:border-black/10'}`}
                />
                <p className="mt-2 text-[12px] text-black/30">
                  잊어버리면 복구가 어려워요. 꼭 기억해두세요.
                </p>
                {errors.pin && (
                  <p className="mt-1 text-[12px] text-red-500">{errors.pin}</p>
                )}
              </div>

              {/* 서버 오류 */}
              {errors.submit && (
                <p className="text-[13px] text-red-500 text-center py-2">{errors.submit}</p>
              )}

              {/* 제출 버튼 */}
              <div className="pt-3">
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
                      만드는 중...
                    </span>
                  ) : (
                    '롤링페이퍼 만들기'
                  )}
                </button>
              </div>
            </form>
          </>
        )}

        {/* 다른 기기에서 만든 방 찾기 — 항상 노출 (이메일을 키로 사용) */}
        <div className="mt-10 pt-6 border-t border-black/5 text-center">
          <p className="text-[12px] text-black/40 mb-2">이미 만드셨나요?</p>
          <Link
            to="/my-rooms"
            className="text-[13px] font-bold text-black/70 hover:text-black transition-colors
                       underline underline-offset-4 decoration-black/20 hover:decoration-black"
          >
            이메일로 내 롤링페이퍼 찾기 →
          </Link>
        </div>

      </div>
    </main>
  )
}
