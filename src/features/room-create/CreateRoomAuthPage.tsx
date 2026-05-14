import { useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useCreateRoom } from './useCreateRoom'

/** 1단계에서 router state로 넘긴 값 */
interface LocationState {
  recipientName?: string
  hostName?: string
}

export default function CreateRoomAuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state    = (location.state ?? {}) as LocationState
  const recipientName = state.recipientName ?? ''
  const hostName      = state.hostName      ?? ''

  // 1단계 값 없이 직접 접근(새로고침 포함)한 경우 1단계로 돌려보낸다.
  useEffect(() => {
    if (!recipientName || !hostName) {
      navigate('/create', { replace: true })
    }
  }, [recipientName, hostName, navigate])

  const {
    values,
    errors,
    isLoading,
    handleChange,
    handlePinChange,
    handleSubmit,
  } = useCreateRoom({
    initial: { recipientName, hostName },
  })

  // 리다이렉트 직전엔 렌더할 필요 없음
  if (!recipientName || !hostName) return null

  return (
    <main className="min-h-dvh bg-white flex items-start justify-center px-5 py-14">
      <div className="w-full max-w-md">

        {/* 헤딩 */}
        <h1 className="text-[2.2rem] font-black text-black leading-[1.15] tracking-tight mb-2">
          비밀번호를<br />설정해주세요
        </h1>
        <p className="text-black/40 text-[14px] mb-8">
          <span className="text-black/70 font-medium">{recipientName}</span>님께 드릴 롤링페이퍼,
          만든이 <span className="text-black/70 font-medium">{hostName}</span> 님
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* 이메일 (선택) */}
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

          {/* 비밀번호 */}
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

          {/* 액션 버튼 그룹 */}
          <div className="pt-3 space-y-2.5">
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
            <Link
              to="/create"
              className="block w-full py-4 text-center
                         bg-white border border-[#d4d4d4]
                         text-black/70 hover:border-black hover:text-black
                         font-semibold text-[15px]
                         rounded-full transition-colors"
            >
              ← 이전
            </Link>
          </div>
        </form>

      </div>
    </main>
  )
}
