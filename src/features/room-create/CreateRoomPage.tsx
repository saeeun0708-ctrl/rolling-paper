import { useCreateRoom } from './useCreateRoom'

export default function CreateRoomPage() {
  const { values, errors, isLoading, handleChange, handlePinChange, handleSubmit } = useCreateRoom()

  return (
    <main className="min-h-dvh bg-grass-50 flex items-start justify-center px-5 py-12">
      <div className="w-full max-w-md">

        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌿</div>
          <h1 className="text-2xl font-bold text-grass-800">롤링페이퍼 만들기</h1>
          <p className="mt-2 text-sm text-grass-500">
            소중한 분께 꽃밭 가득한 마음을 전해보세요
          </p>
        </div>

        {/* 폼 카드 */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-sm border border-grass-100 p-7 space-y-6"
        >

          {/* 받는 분 이름 */}
          <div>
            <label className="block text-sm font-semibold text-grass-700 mb-1.5">
              받는 분 이름 / 호칭
            </label>
            <input
              type="text"
              value={values.recipientName}
              onChange={e => handleChange('recipientName', e.target.value)}
              placeholder="예: 엄마, 아버지, 김선생님"
              maxLength={30}
              className={`w-full px-4 py-3.5 rounded-xl border bg-grass-50 text-grass-900
                          placeholder:text-grass-300 focus:outline-none focus:ring-2 focus:ring-grass-400
                          text-base transition-colors
                          ${errors.recipientName ? 'border-carnation-400' : 'border-grass-200'}`}
            />
            {errors.recipientName && (
              <p className="mt-1.5 text-xs text-carnation-500">{errors.recipientName}</p>
            )}
          </div>

          {/* 주최자 이름 */}
          <div>
            <label className="block text-sm font-semibold text-grass-700 mb-1.5">
              주최자 이름 (나)
            </label>
            <input
              type="text"
              value={values.hostName}
              onChange={e => handleChange('hostName', e.target.value)}
              placeholder="예: 큰딸, 홍길동"
              maxLength={20}
              className={`w-full px-4 py-3.5 rounded-xl border bg-grass-50 text-grass-900
                          placeholder:text-grass-300 focus:outline-none focus:ring-2 focus:ring-grass-400
                          text-base transition-colors
                          ${errors.hostName ? 'border-carnation-400' : 'border-grass-200'}`}
            />
            {errors.hostName && (
              <p className="mt-1.5 text-xs text-carnation-500">{errors.hostName}</p>
            )}
          </div>

          {/* 관리 PIN */}
          <div>
            <label className="block text-sm font-semibold text-grass-700 mb-1.5">
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
              className={`w-full px-4 py-3.5 rounded-xl border bg-grass-50 text-grass-900
                          placeholder:text-grass-300 focus:outline-none focus:ring-2 focus:ring-grass-400
                          text-base tracking-widest transition-colors
                          ${errors.pin ? 'border-carnation-400' : 'border-grass-200'}`}
            />
            {/* PIN 분실 안내 — 항상 표시 */}
            <p className="mt-1.5 text-xs text-grass-400">
              ⚠️ PIN을 분실하면 복구할 수 없습니다. 반드시 기억해두세요.
            </p>
            {errors.pin && (
              <p className="mt-1 text-xs text-carnation-500">{errors.pin}</p>
            )}
          </div>

          {/* 서버 오류 */}
          {errors.submit && (
            <div className="rounded-xl bg-carnation-50 border border-carnation-200 px-4 py-3">
              <p className="text-sm text-carnation-600 text-center">{errors.submit}</p>
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-carnation-500 hover:bg-carnation-600 active:bg-carnation-700
                       disabled:opacity-60 disabled:cursor-not-allowed
                       text-white font-bold text-lg rounded-2xl transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                만드는 중...
              </span>
            ) : (
              '🌸 롤링페이퍼 만들기'
            )}
          </button>
        </form>
      </div>
    </main>
  )
}
