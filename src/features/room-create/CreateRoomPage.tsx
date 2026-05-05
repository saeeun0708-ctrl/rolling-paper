import { useCreateRoom } from './useCreateRoom'

export default function CreateRoomPage() {
  const { values, errors, isLoading, handleChange, handlePinChange, handleSubmit } = useCreateRoom()

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

        {/* 폼 */}
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

          {/* 주최자 이름 */}
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

      </div>
    </main>
  )
}
