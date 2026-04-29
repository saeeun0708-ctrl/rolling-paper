import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function SharePage() {
  const { slug } = useParams<{ slug: string }>()
  const location  = useLocation()
  const navigate  = useNavigate()

  // router state로 전달된 값을 우선 사용; 직접 URL 접근 시 Supabase에서 조회
  const [recipientName, setRecipientName] = useState<string>(
    (location.state as { recipientName?: string })?.recipientName ?? ''
  )
  const [copied, setCopied] = useState(false)

  const shareUrl = `${window.location.origin}/r/${slug}`

  // state가 없을 때(새로고침 등) 방 정보를 Supabase에서 가져옴
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

  /** URL 클립보드 복사 */
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API 미지원 시 fallback
      const el = document.createElement('input')
      el.value = shareUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  /** 카카오 공유 — 5단계에서 SDK 연동 예정 */
  function handleKakao() {
    // TODO: 5단계 — 카카오 SDK initWithWebKey + sendDefault 연동
    console.log('[카카오 공유 stub] 공유 URL:', shareUrl)
    alert('카카오톡 공유는 5단계에서 연동됩니다 🙏')
  }

  return (
    <main className="min-h-dvh bg-grass-50 flex items-start justify-center px-5 py-12">
      <div className="w-full max-w-md">

        {/* 성공 헤더 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌸</div>
          <h1 className="text-2xl font-bold text-grass-800 leading-snug">
            {recipientName
              ? <>{recipientName}님께 보내는<br />롤링페이퍼가 만들어졌어요!</>
              : '롤링페이퍼가 만들어졌어요!'}
          </h1>
          <p className="mt-3 text-sm text-grass-500">
            아래 링크를 공유해서 마음을 모아보세요 💌
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-grass-100 p-7 space-y-5">

          {/* 작성용 링크 표시 */}
          <div>
            <p className="text-xs font-semibold text-grass-500 uppercase tracking-wide mb-2">
              작성용 링크
            </p>
            <div className="flex items-center bg-grass-50 rounded-xl px-4 py-3.5 border border-grass-200">
              <span className="text-sm text-grass-700 break-all select-all">{shareUrl}</span>
            </div>
            <p className="mt-1.5 text-xs text-grass-400">이 링크를 받은 분들이 메시지를 작성합니다.</p>
          </div>

          {/* 공유 버튼 3개 */}
          <div className="space-y-3 pt-1">

            {/* 카카오톡 공유 */}
            <button
              onClick={handleKakao}
              className="w-full py-4 bg-[#FEE500] hover:bg-[#f5db00] active:bg-[#ead000]
                         text-[#3c1e1e] font-bold text-base rounded-2xl transition-colors
                         flex items-center justify-center gap-2"
            >
              <span className="text-xl">💬</span>
              카카오톡으로 공유
            </button>

            {/* URL 복사 */}
            <button
              onClick={handleCopy}
              className={`w-full py-4 font-bold text-base rounded-2xl transition-colors
                          flex items-center justify-center gap-2
                          ${copied
                            ? 'bg-grass-500 text-white'
                            : 'bg-grass-100 hover:bg-grass-200 text-grass-700'}`}
            >
              <span>{copied ? '✅' : '🔗'}</span>
              {copied ? '복사됐어요!' : 'URL 복사'}
            </button>

            {/* 주최자 대시보드 */}
            <button
              onClick={() => navigate(`/r/${slug}/host`)}
              className="w-full py-4 border-2 border-grass-200 hover:border-grass-400
                         text-grass-700 font-bold text-base rounded-2xl transition-colors
                         flex items-center justify-center gap-2"
            >
              <span>📋</span>
              주최자 대시보드 가기
            </button>
          </div>
        </div>

        {/* 유효기간 안내 */}
        <p className="mt-6 text-center text-xs text-grass-400">
          🌿 롤링페이퍼 링크는 90일간 유효합니다
        </p>
      </div>
    </main>
  )
}
