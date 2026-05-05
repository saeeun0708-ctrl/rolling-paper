import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

// 버튼 공통 클래스 — Wise 필 + scale 호버
const pillBtn = `
  w-full py-4 font-bold text-base rounded-full
  transition-transform duration-150
  hover:scale-[1.02] active:scale-[0.97]
  flex items-center justify-center gap-2
`.trim()

export default function SharePage() {
  const { slug }   = useParams<{ slug: string }>()
  const location   = useLocation()
  const navigate   = useNavigate()

  const [recipientName, setRecipientName] = useState<string>(
    (location.state as { recipientName?: string })?.recipientName ?? ''
  )
  const [copied, setCopied] = useState(false)

  const shareUrl = `${window.location.origin}/r/${slug}`

  // 새로고침 등으로 state가 없을 때 Supabase에서 recipient_name 조회
  useEffect(() => {
    if (recipientName || !slug) return
    supabase
      .from('rooms')
      .select('recipient_name')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        if (data) setRecipientName(data.recipient_name)
      })
  }, [slug, recipientName])

  /** 클립보드 복사 */
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
      // fallback
      const el = document.createElement('input')
      el.value = shareUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /** 카카오 공유 — 5단계에서 SDK 연동 예정 */
  function handleKakao() {
    // TODO: 5단계 — 카카오 SDK initWithWebKey + sendDefault 연동
    console.log('[카카오 공유 stub] 공유 URL:', shareUrl)
    alert('카카오톡 공유는 5단계에서 연동됩니다 🙏')
  }

  return (
    <main className="min-h-dvh bg-white flex items-start justify-center px-5 py-14">
      <div className="w-full max-w-md">

        {/* 완성 배지 */}
        <div className="inline-flex items-center gap-1.5 bg-wise-light-mint text-wise-dark-green
                        text-sm font-semibold px-4 py-1.5 rounded-full mb-7">
          ✨ 완성됐어요
        </div>

        {/* 디스플레이 헤딩 */}
        <h1 className="text-[2.6rem] font-black text-wise-black leading-[0.92] tracking-tight mb-4">
          {recipientName
            ? <>{recipientName}님께<br />보내는 롤링페이퍼</>
            : <>롤링페이퍼가<br />완성됐어요</>}
        </h1>
        <p className="text-wise-warm-dark text-base mb-8">
          아래 링크를 공유해서 마음을 모아보세요 💌
        </p>

        {/* 링크 카드 — Wise 링 쉐도우 */}
        <div className="rounded-[24px] border border-[rgba(14,15,12,0.12)]
                        shadow-[rgba(14,15,12,0.08)_0px_0px_0px_1px]
                        p-5 mb-6 bg-wise-light-surface">
          <p className="text-xs font-semibold text-wise-gray uppercase tracking-widest mb-2">
            작성용 링크
          </p>
          <p className="text-sm text-wise-black break-all font-mono leading-relaxed">
            {shareUrl}
          </p>
          <p className="mt-2 text-xs text-wise-gray">
            이 링크를 받으면 누구나 메시지를 작성할 수 있어요
          </p>
        </div>

        {/* 버튼 3개 */}
        <div className="space-y-3">

          {/* 카카오톡 */}
          <button
            onClick={handleKakao}
            className={`${pillBtn} bg-[#FEE500] hover:bg-[#f5db00] text-[#3c1e1e]`}
          >
            <span className="text-lg">💬</span>
            카카오톡으로 공유
          </button>

          {/* URL 복사 — 복사 후 Wise Green으로 전환 */}
          <button
            onClick={handleCopy}
            className={`${pillBtn} ${
              copied
                ? 'bg-wise-green text-wise-dark-green'
                : 'bg-wise-light-mint text-wise-dark-green hover:bg-wise-pastel-green'
            }`}
          >
            <span>{copied ? '✅' : '🔗'}</span>
            {copied ? '복사됐어요!' : 'URL 복사'}
          </button>

          {/* 주최자 대시보드 */}
          <button
            onClick={() => navigate(`/r/${slug}/host`)}
            className={`${pillBtn} border border-[rgba(14,15,12,0.2)]
                         hover:border-wise-black text-wise-black`}
          >
            <span>📋</span>
            주최자 대시보드 가기
          </button>
        </div>

        {/* 유효기간 */}
        <p className="mt-8 text-center text-xs text-wise-gray">
          🌿 롤링페이퍼 링크는 90일간 유효합니다
        </p>
      </div>
    </main>
  )
}
