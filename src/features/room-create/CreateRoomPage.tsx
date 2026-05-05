import { useCreateRoom } from './useCreateRoom'

// 입력 필드 공통 클래스
const inputBase = `
  w-full px-4 py-3.5 rounded-[10px] border bg-white
  text-wise-black placeholder:text-wise-gray
  text-base font-normal
  focus:outline-none focus:shadow-[rgb(134,134,133)_0px_0px_0px_1px_inset]
  transition-shadow
`.trim()

export default function CreateRoomPage() {
  const { values, errors, isLoading, handleChange, handlePinChange, handleSubmit } = useCreateRoom()

  return (
    <main className="min-h-dvh bg-white flex items-start justify-center px-5 py-14">
      <div className="w-full max-w-md">

        {/* 배지 */}
        <div className="inline-flex items-center gap-1.5 bg-wise-light-mint text-wise-dark-green
                        text-sm font-semibold px-4 py-1.5 rounded-full mb-7">
          🌿 롤링페이퍼
        </div>

        {/* 디스플레이 헤딩 — Wise 스타일: 초대형·굵게·타이트 */}
        <h1 className="text-[2.6rem] font-black text-wise-black leading-[0.92] tracking-tight mb-4">
          소중한 분께<br />마음을 모아요
        </h1>
        <p className="text-wise-warm-dark text-base mb-10">
          메시지를 모아 특별한 롤링페이퍼를 만들어보세요
        </p>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* 받는 분 이름 */}
          <div>
            <label className="block text-sm font-semibold text-wise-black mb-2">
              받는 분 이름 / 호칭
            </label>
            <input
              type="text"
              value={values.recipientName}
              onChange={e => handleChange('recipientName', e.target.value)}
              placeholder="예: 엄마, 아버지, 김선생님"
              maxLength={30}
              className={`${inputBase} ${errors.recipientName ? 'border-red-400' : 'border-[rgba(14,15,12,0.2)]'}`}
            />
            {errors.recipientName && (
              <p className="mt-1.5 text-xs text-red-500">{errors.recipientName}</p>
            )}
          </div>

          {/* 주최자 이름 */}
          <div>
            <label className="block text-sm font-semibold text-wise-black mb-2">
              주최자 이름 (나)
            </label>
            <input
              type="text"
              value={values.hostName}
              onChange={e => handleChange('hostName', e.target.value)}
              placeholder="예: 큰딸, 홍길동"
              maxLength={20}
              className={`${inputBase} ${errors.hostName ? 'border-red-400' : 'border-[rgba(14,15,12,0.2)]'}`}
            />
            {errors.hostName && (
              <p className="mt-1.5 text-xs text-red-500">{errors.hostName}</p>
            )}
          </div>

          {/* 관리 PIN */}
          <div>
            <label className="block text-sm font-semibold text-wise-black mb-2">
              관리 PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={values.pin}
              onChange={e => handlePinChange(e.target.value)}
              placeholder="숫자 4~6자리"
              autoComplete="new-password"
              className={`${inputBase} tracking-widest ${errors.pin ? 'border-red-400' : 'border-[rgba(14,15,12,0.2)]'}`}
            />
            {/* PIN 분실 경고 — 항상 표시 */}
            <p className="mt-2 text-xs text-wise-gray">
              ⚠️ PIN을 분실하면 복구할 수 없습니다. 반드시 기억해두세요.
            </p>
            {errors.pin && (
              <p className="mt-1 text-xs text-red-500">{errors.pin}</p>
            )}
          </div>

          {/* 서버 오류 */}
          {errors.submit && (
            <div className="rounded-[10px] bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-600 text-center">{errors.submit}</p>
            </div>
          )}

          {/* CTA 버튼 — Wise 라임 그린 필 + scale 호버 */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4
                         bg-wise-green hover:bg-wise-pastel-green
                         text-wise-dark-green font-bold text-lg
                         rounded-full
                         shadow-[rgba(14,15,12,0.12)_0px_0px_0px_1px]
                         transition-transform duration-150
                         hover:scale-[1.02] active:scale-[0.97]
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin w-5 h-5 border-2 border-wise-dark-green border-t-transparent rounded-full inline-block" />
                  만드는 중...
                </span>
              ) : (
                '롤링페이퍼 만들기 →'
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
