import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import ShareModal from '../../components/ShareModal'

// 필 버튼 공통 클래스 (모바일 터치 타겟 44pt 기준)
const pillBtn = `w-full py-3 font-bold text-base rounded-full transition-colors
                 flex items-center justify-center`.trim()

export default function SharePage() {
  const { slug }  = useParams<{ slug: string }>()
  const location  = useLocation()
  const navigate  = useNavigate()

  const [recipientName, setRecipientName] = useState<string>(
    (location.state as { recipientName?: string })?.recipientName ?? ''
  )
  // 공유 방법 선택 모달 (HostPage와 동일한 UX 흐름)
  const [showShare, setShowShare] = useState(false)

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

  return (
    <main className="min-h-dvh bg-white flex items-start justify-center px-5 py-14">
      <div className="w-full max-w-md">

        {/* 디스플레이 헤딩 — 받는 분 이름을 헤딩 자체에 담아 다음 액션을 자연스럽게 연결 */}
        <h1 className="text-[2.2rem] font-black text-black leading-[1.2] tracking-[-0.5px] mb-3">
          {recipientName ? (
            <>
              <span className="text-[#5cb054]">{recipientName}</span>{honorific} 보내는<br />
              롤링페이퍼가 만들어졌어요
            </>
          ) : (
            <>롤링페이퍼가<br />만들어졌어요</>
          )}
        </h1>
        <p className="text-black/55 text-[15px] mb-7 leading-relaxed">
          이제 링크를 공유해서 마음을 모아보세요.
        </p>

        {/* 액션 — 헤딩과 일치하는 1순위(링크 공유) + 보조(메시지 작성) */}
        <div className="space-y-2.5">

          {/* 링크 공유하기 — 1순위 (블랙 필). 공유 방법(카카오 / 링크 복사) 선택 모달 */}
          <button
            onClick={() => setShowShare(true)}
            className={`${pillBtn} bg-black hover:bg-black/80 text-white`}
          >
            작성 링크 공유하기
          </button>

          {/* 메시지 작성하기 — 2순위 (흰 아웃라인). 만든이 본인이 한 마디 남기는 보조 동선 */}
          <button
            onClick={() => navigate(`/r/${slug}`)}
            className={`${pillBtn} border border-[#d4d4d4] hover:border-black
                         bg-white text-black`}
          >
            메시지 작성하기
          </button>
        </div>

        {/* 3순위 — 내 페이지 가기. 성격이 다른 액션이라 약하게 분리 */}
        <button
          onClick={() => navigate(`/r/${slug}/host`)}
          className="block mx-auto mt-5 py-2 text-[14px] text-black/55 hover:text-black underline underline-offset-4"
        >
          내 페이지 가기
        </button>

      </div>

      {/* 공유 방법 선택 모달 — HostPage와 동일한 흐름 */}
      {showShare && (
        <ShareModal
          title={`${recipientName}${honorific} 보내는 롤링페이퍼`}
          description="한 마디 남겨주세요 🌿"
          url={shareUrl}
          onClose={() => setShowShare(false)}
        />
      )}
    </main>
  )
}
