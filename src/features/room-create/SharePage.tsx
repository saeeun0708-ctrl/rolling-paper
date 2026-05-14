import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { shareKakao } from '../../lib/kakao'

// 필 버튼 공통 클래스
const pillBtn = `w-full py-[10px] font-bold text-base rounded-full transition-colors
                 flex items-center justify-center`.trim()

export default function SharePage() {
  const { slug }  = useParams<{ slug: string }>()
  const location  = useLocation()
  const navigate  = useNavigate()

  const [recipientName, setRecipientName] = useState<string>(
    (location.state as { recipientName?: string })?.recipientName ?? ''
  )
  const [copied, setCopied] = useState(false)

  // "부모님" → "부모님께", "엄마" → "엄마님께" (중복 존칭 방지)
  const honorific = recipientName.endsWith('님') ? '께' : '님께'

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

  /** 클립보드 복사(폴백 포함) */
  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const el = document.createElement('input')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
  }

  async function handleCopy() {
    await copyText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleKakao() {
    shareKakao(
      `${recipientName}${honorific} 보내는 롤링페이퍼`,
      '한 마디 남겨주세요 🌿',
      shareUrl
    )
  }

  return (
    <main className="min-h-dvh bg-white flex items-start justify-center px-5 py-14">
      <div className="w-full max-w-md">

        {/* 받는 분 정체성 라벨 (이름이 있을 때만) */}
        {recipientName ? (
          <p className="text-[14px] text-black/60 mb-3">
            <span className="font-bold text-[#5cb054]">{recipientName}</span>{honorific} 보내는 롤링페이퍼
          </p>
        ) : (
          <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-black/30 mb-5">
            Link Ready
          </p>
        )}

        {/* 디스플레이 헤딩 — 공간이 만들어졌고 다음 액션이 무엇인지 안내 */}
        <h1 className="text-[2.2rem] font-black text-black leading-[1.2] tracking-[-0.5px] mb-3">
          우리만의 롤링페이퍼<br />공간이 만들어졌어요.
        </h1>
        <p className="text-black/55 text-[15px] mb-7 leading-relaxed">
          이제 링크를 공유해서 마음을 모아보세요.
        </p>

        {/* 링크 카드 */}
        <div className="rounded-2xl bg-[#f5f5f5] px-5 py-4 mb-4">
          <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-black/30 mb-1.5">
            작성용 링크
          </p>
          <p className="text-[13px] text-black break-all leading-relaxed">
            {shareUrl}
          </p>
          <p className="mt-1.5 text-[12px] text-black/30">
            이 링크를 받으면 누구나 메시지를 작성할 수 있어요 · 90일 유효
          </p>
        </div>

        {/* 버튼 3개 — URL 복사 최우선 */}
        <div className="space-y-2.5">

          {/* URL 복사 — 1순위 (블랙 필) */}
          <button
            onClick={handleCopy}
            className={`${pillBtn} ${
              copied
                ? 'bg-[#5cb054] text-white'
                : 'bg-black hover:bg-black/80 text-white'
            }`}
          >
            {copied ? '복사됐어요!' : 'URL 복사'}
          </button>

          {/* 카카오톡 — 2순위 */}
          <button
            onClick={handleKakao}
            className={`${pillBtn} bg-[#FEE500] hover:bg-[#f5db00] text-[#3c1e1e]`}
          >
            카카오톡으로 공유
          </button>

          {/* 내 페이지 — 3순위 (아웃라인) */}
          <button
            onClick={() => navigate(`/r/${slug}/host`)}
            className={`${pillBtn} border border-[#e6e6e6] hover:border-black
                         bg-white text-black`}
          >
            내 페이지 가기
          </button>
        </div>

        {/* 보관 안내 한 줄 — 별도 host URL 카드 대신 자연스러운 행동 권장 */}
        <p className="mt-6 text-[12px] text-black/40 leading-relaxed text-center">
          공유한 링크에서 만든이로 다시 들어올 수 있어요.<br />
          <span className="text-black/55">본인 카톡에도 보내두면 안전해요.</span>
        </p>

      </div>
    </main>
  )
}
