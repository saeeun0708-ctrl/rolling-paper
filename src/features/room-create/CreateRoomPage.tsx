import { useCreateRoom } from './useCreateRoom'

// 인풋 공통 클래스 — Figma text-input 스펙
const inputBase = `
  w-full px-[14px] py-3 rounded-lg border border-figma-hairline bg-figma-canvas
  text-figma-ink text-base placeholder:text-figma-ink/30
  focus:outline-none focus:ring-2 focus:ring-figma-ink/20
  transition-shadow
`.trim()

export default function CreateRoomPage() {
  const { values, errors, isLoading, handleChange, handlePinChange, handleSubmit } = useCreateRoom()

  return (
    <main className="min-h-dvh bg-figma-canvas flex items-start justify-center px-5 py-14">
      <div className="w-full max-w-md">

        {/* 아이브로우 — figmaMono 스타일: 모노, 대문자, 양의 자간 */}
        <p className="font-mono text-xs tracking-[0.54px] uppercase text-figma-ink/40 mb-6">
          Rolling Paper
        </p>

        {/* 디스플레이 헤딩 — 크고 굵게, 타이트한 자간 */}
        <h1 className="text-[2.6rem] font-black text-figma-ink leading-[1.1] tracking-[-1px] mb-3">
          소중한 분께<br />마음을 모아요
        </h1>
        <p className="text-figma-ink/50 text-base leading-relaxed mb-10">
          메시지를 모아 특별한 롤링페이퍼를 만들어보세요
        </p>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* 받는 분 이름 */}
          <div>
            <label className="block text-sm font-bold text-figma-ink mb-2">
              받는 분 이름 / 호칭
            </label>
            <input
              type="text"
              value={values.recipientName}
              onChange={e => handleChange('recipientName', e.target.value)}
              placeholder="예: 엄마, 아버지, 김선생님"
              maxLength={30}
              className={`${inputBase} ${errors.recipientName ? 'border-red-400 ring-2 ring-red-100' : ''}`}
            />
            {errors.recipientName && (
              <p className="mt-1.5 text-xs text-red-500">{errors.recipientName}</p>
            )}
          </div>

          {/* 주최자 이름 */}
          <div>
            <label className="block text-sm font-bold text-figma-ink mb-2">
              주최자 이름 (나)
            </label>
            <input
              type="text"
              value={values.hostName}
              onChange={e => handleChange('hostName', e.target.value)}
              placeholder="예: 큰딸, 홍길동"
              maxLength={20}
              className={`${inputBase} ${errors.hostName ? 'border-red-400 ring-2 ring-red-100' : ''}`}
            />
            {errors.hostName && (
              <p className="mt-1.5 text-xs text-red-500">{errors.hostName}</p>
            )}
          </div>

          {/* 관리 PIN */}
          <div>
            <label className="block text-sm font-bold text-figma-ink mb-2">
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
              className={`${inputBase} tracking-widest ${errors.pin ? 'border-red-400 ring-2 ring-red-100' : ''}`}
            />
            {/* PIN 분실 경고 */}
            <p className="mt-2 text-xs text-figma-ink/40">
              ⚠️ PIN을 분실하면 복구할 수 없습니다. 반드시 기억해두세요.
            </p>
            {errors.pin && (
              <p className="mt-1 text-xs text-red-500">{errors.pin}</p>
            )}
          </div>

          {/* 라임 컬러 블록 — Figma 시그니처 */}
          <div className="rounded-[24px] bg-figma-block-lime px-5 py-4">
            <p className="text-sm text-figma-ink leading-relaxed">
              🌿 링크 하나로 20~30명이 함께 메시지를 남길 수 있어요.
              작성이 끝나면 포장해서 받는 분께 전달하세요.
            </p>
          </div>

          {/* 서버 오류 */}
          {errors.submit && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-600 text-center">{errors.submit}</p>
            </div>
          )}

          {/* 블랙 필 CTA 버튼 — Figma button-primary */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-[10px] bg-figma-ink hover:bg-figma-ink/80
                         text-figma-canvas font-bold text-base
                         rounded-full transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
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
