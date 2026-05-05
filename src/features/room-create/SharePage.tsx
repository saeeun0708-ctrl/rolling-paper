import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

// 필 버튼 공통 클래스 — Figma rounded.pill(50px)
const pillBtn = `w-full py-[10px] font-bold text-base rounded-full transition-colors
                 flex items-center justify-center gap-2`.trim()

export default function SharePage() {
  const { slug }  = useParams<{ slug: string }>()
  const location  = useLocation()
  const navigate  = useNavigate()

  const [recipientName, setRecipientName] = useState<string>(
    (location.state as { recipientName?: string })?.recipientName ?? ''
  )
  const [copied, setCopied] = useState(false)

  const shareUrl = `${window.location.origin}/r/${slug}`

  // 새로고침 시 Supabase에서 recipient_name 조회
  useEffect(() => {
    if (recipientName || !slug) return
    supabase
      .from('rooms')
      .select('recipient_name')
      .eq('slug', slug)
      .single()
      .then(({ data }) => { if (data) setRecipientName(data.recipient_name) })
  }, [slug, recipientName])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
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

  function handleKakao() {
    // TODO: 5단계 — 카카오 SDK 연동
    console.log('[카카오 공유 stub] 공유 URL:', shareUrl)
    alert('카카오톡 공유는 5단계에서 연동됩니다 🙏')
  }

  return (
    <main className="min-h-dvh bg-figma-canvas flex items-start justify-center px-5 py-14">
      <div className="w-full max-w-md">

        {/* 아이브로우 */}
        <p className="font-mono text-xs tracking-[0.54px] uppercase text-figma-ink/40 mb-6">
          Link Ready
        </p>

        {/* 디스플레이 헤딩 */}
        <h1 className="text-[2.6rem] font-black text-figma-ink leading-[1.1] tracking-[-1px] mb-3">
          {recipientName
            ? <>{recipientName}님께<br />보내는 롤링페이퍼</>
            : <>롤링페이퍼가<br />완성됐어요</>}
        </h1>
        <p className="text-figma-ink/50 text-base leading-relaxed mb-8">
          아래 링크를 공유해서 마음을 모아보세요 💌
        </p>

        {/* 라임 컬러 블록 — 링크 표시 */}
        <div className="rounded-[24px] bg-figma-block-lime px-5 py-5 mb-6">
          <p className="font-mono text-[10px] tracking-[0.6px] uppercase text-figma-ink/50 mb-2">
            작성용 링크
          </p>
          <p className="text-sm text-figma-ink break-all leading-relaxed">
            {shareUrl}
          </p>
          <p className="mt-2 text-xs text-figma-ink/50">
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
            <span>💬</span> 카카오톡으로 공유
          </button>

          {/* URL 복사 — Figma button-primary (블랙) */}
          <button
            onClick={handleCopy}
            className={`${pillBtn} ${
              copied
                ? 'bg-figma-success text-white'
                : 'bg-figma-ink hover:bg-figma-ink/80 text-figma-canvas'
            }`}
          >
            <span>{copied ? '✅' : '🔗'}</span>
            {copied ? '복사됐어요!' : 'URL 복사'}
          </button>

          {/* 주최자 대시보드 — Figma button-secondary (화이트 아웃라인) */}
          <button
            onClick={() => navigate(`/r/${slug}/host`)}
            className={`${pillBtn} border border-figma-hairline hover:border-figma-ink
                         bg-figma-canvas text-figma-ink`}
          >
            <span>📋</span> 주최자 대시보드 가기
          </button>
        </div>

        {/* 캡션 — figmaMono 스타일 */}
        <p className="mt-8 text-center font-mono text-[10px] tracking-[0.6px] uppercase text-figma-ink/30">
          링크 유효기간 · 90일
        </p>
      </div>
    </main>
  )
}
