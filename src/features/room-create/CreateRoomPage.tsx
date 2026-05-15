import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getMyRooms, removeMyRoom, type MyRoom } from '../../lib/myRooms'

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

/** 이름 뒤에 붙일 존칭만 반환 ("엄마" → "님께", "부모님" → "께") */
function honorificSuffix(name: string): string {
  return name.endsWith('님') ? '께' : '님께'
}

interface StepOneErrors {
  recipientName?: string
  hostName?: string
}

interface CreateRoomPageProps {
  /** 이 기기 목록·디스클로저를 무시하고 항상 폼만 노출 (별도 라우트 /create/new 용) */
  forceFormOnly?: boolean
}

export default function CreateRoomPage({ forceFormOnly = false }: CreateRoomPageProps = {}) {
  const navigate = useNavigate()
  // 1단계: 받는 분 이름·내 이름만 페이지 내부 state 로 관리한다.
  const [recipientName, setRecipientName] = useState('')
  const [hostName, setHostName]           = useState('')
  const [errors, setErrors]               = useState<StepOneErrors>({})

  const [myRooms, setMyRooms] = useState<MyRoom[]>([])
  // 카드가 있을 땐 폼을 디스클로저로 접어 핵심 동선(기존 방으로 들어가기)에 집중
  const [showForm, setShowForm] = useState(forceFormOnly)

  // 마운트 시 한 번 로컬에 저장된 내 방 목록 로드 (폼 단독 모드는 스킵)
  useEffect(() => {
    if (forceFormOnly) return
    const list = getMyRooms()
    setMyRooms(list)
    // 저장된 방이 없으면 폼은 처음부터 펼쳐서 보여준다
    setShowForm(list.length === 0)
  }, [forceFormOnly])

  /** 이 기기 목록에서 제거 (Supabase 데이터는 그대로 둠) */
  function handleRemoveLocal(slug: string) {
    if (!window.confirm('이 기기 목록에서만 지울게요. 나중에 링크로는 다시 들어갈 수 있어요.')) return
    removeMyRoom(slug)
    const next = getMyRooms()
    setMyRooms(next)
    // 카드를 모두 지웠다면 폼을 자동으로 펼쳐서 다음 행동을 명확히
    if (next.length === 0) setShowForm(true)
  }

  /** '다음' 제출 — 1단계 값을 검증하고 2단계 페이지로 이동. router state로 값 전달. */
  function handleNext(e: FormEvent) {
    e.preventDefault()
    const errs: StepOneErrors = {}
    if (!recipientName.trim()) errs.recipientName = '받는 분 이름을 입력해주세요.'
    if (!hostName.trim())      errs.hostName      = '만든이 이름을 입력해주세요.'
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    navigate('/create/auth', {
      state: {
        recipientName: recipientName.trim(),
        hostName:      hostName.trim(),
      },
    })
  }

  const hasMyRooms = myRooms.length > 0

  return (
    <main className="min-h-dvh bg-white flex items-start justify-center px-5 py-14">
      <div className="w-full max-w-md">

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
              이 기기에서 만든 롤링페이퍼
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
          </section>
        )}

        {/* 새로 만들기 — 카드가 있으면 별도 화면으로 이동시켜 핵심 동선과 분리한다 */}
        {hasMyRooms && !showForm && (
          <Link
            to="/create/new"
            className="block w-full py-3.5 mt-2 rounded-full border border-[#e6e6e6]
                       text-center text-[13px] font-bold text-black/70
                       hover:border-black hover:text-black transition-colors"
          >
            + 새 롤링페이퍼 만들기
          </Link>
        )}

        {/* 1단계 폼 — 받는 분/내 이름 + 다음 버튼 */}
        {showForm && (
          <>
            {hasMyRooms && (
              <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-black/40 mt-2 mb-3">
                새로 만들기
              </p>
            )}
            <form onSubmit={handleNext} className="space-y-4">

              {/* 받는 분 이름 */}
              <div>
                <label className="block text-[13px] font-medium text-black/50 mb-1.5">
                  받으실 분
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={e => {
                    setRecipientName(e.target.value)
                    if (errors.recipientName) setErrors(prev => ({ ...prev, recipientName: undefined }))
                  }}
                  placeholder="예: 사랑하는 엄마, 오은영 선생님"
                  maxLength={30}
                  className={`w-full px-4 py-3.5 rounded-xl text-[15px] text-black
                              bg-[#f5f5f5] placeholder:text-[13px] placeholder:text-black/20
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
                  value={hostName}
                  onChange={e => {
                    setHostName(e.target.value)
                    if (errors.hostName) setErrors(prev => ({ ...prev, hostName: undefined }))
                  }}
                  placeholder="예: 큰딸, 백예린"
                  maxLength={20}
                  className={`w-full px-4 py-3.5 rounded-xl text-[15px] text-black
                              bg-[#f5f5f5] placeholder:text-[13px] placeholder:text-black/20
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

              {/* 액션 버튼 그룹 — 다음(검정, 1순위) + 찾기(아웃라인, 2순위) */}
              <div className="pt-3 space-y-2.5">
                <button
                  type="submit"
                  className="w-full py-4 bg-black hover:bg-black/80
                             text-white font-bold text-[15px]
                             rounded-full transition-colors"
                >
                  다음
                </button>
                <Link
                  to="/my-rooms"
                  className="block w-full py-4 text-center
                             bg-white border border-[#d4d4d4]
                             text-black/70 hover:border-black hover:text-black
                             font-semibold text-[15px]
                             rounded-full transition-colors"
                >
                  내 롤링페이퍼 찾기 →
                </Link>
              </div>
            </form>
          </>
        )}

      </div>
    </main>
  )
}
