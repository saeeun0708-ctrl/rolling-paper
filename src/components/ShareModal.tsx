import { useState } from 'react'
import { shareKakao } from '../lib/kakao'

interface Props {
  /** 카카오 공유 카드 제목 */
  title: string
  /** 카카오 공유 카드 설명 */
  description: string
  /** 공유할 URL */
  url: string
  /** 모달 닫기 콜백 */
  onClose: () => void
}

/** 클립보드 복사 — Web API 우선, execCommand 폴백 */
async function copyToClipboard(text: string): Promise<void> {
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

/**
 * 공유 방법 선택 모달
 * 카카오톡 공유와 링크 복사 옵션을 명시적으로 제공한다.
 * 카카오 사용자가 아니거나 다른 채널로 보내고 싶은 사용자도 한 흐름에서 선택 가능.
 */
export default function ShareModal({ title, description, url, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  function handleKakao() {
    shareKakao(title, description, url)
    onClose()
  }

  async function handleCopy() {
    await copyToClipboard(url)
    setCopied(true)
    // 짧게 피드백을 보이고 모달 닫기
    setTimeout(() => {
      setCopied(false)
      onClose()
    }, 900)
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center px-5 z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl p-6 w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-[1.1rem] font-black text-black mb-5 text-center">
          공유 방법 선택
        </h2>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleKakao}
            className="w-full py-3.5 bg-[#FEE500] hover:bg-[#FDD835]
                       text-[#3c1e1e] font-bold text-[14px] rounded-full
                       transition-colors"
          >
            카카오톡으로 공유
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={copied}
            className="w-full py-3.5 bg-black hover:bg-black/80
                       text-white font-bold text-[14px] rounded-full
                       transition-colors disabled:opacity-100"
          >
            {copied ? '복사됐어요!' : '링크 복사'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 text-[13px] text-black/50 hover:text-black
                       transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
