// 카카오 SDK 타입 선언 (초기화 용도로만 유지)
declare global {
  interface Window {
    Kakao: {
      init(key: string): void
      isInitialized(): boolean
      Share: { sendDefault(options: object): void }
    }
  }
}

const KAKAO_KEY = import.meta.env.VITE_KAKAO_KEY as string | undefined

export function initKakao(): void {
  if (!KAKAO_KEY || !window.Kakao) return
  if (window.Kakao.isInitialized()) return
  window.Kakao.init(KAKAO_KEY)
}

/**
 * 공유하기
 * 1순위: Web Share API — OS 기본 공유 시트 (카카오톡·문자·메모 등 선택 가능, URL 완벽 전달)
 * 2순위: 클립보드 복사 + 알림
 */
export async function shareKakao(title: string, description: string, url: string): Promise<void> {
  // ── 1. Web Share API ──────────────────────────────────────────────────────
  if (navigator.share) {
    try {
      await navigator.share({ title, text: description, url })
      return
    } catch (e) {
      // 사용자가 취소한 경우 (AbortError) 조용히 무시
      if (e instanceof Error && e.name === 'AbortError') return
    }
  }

  // ── 2. 클립보드 복사 폴백 ────────────────────────────────────────────────
  try {
    await navigator.clipboard.writeText(url)
    alert('링크를 복사했어요!\n카카오톡을 열고 원하는 대화방에 붙여넣기 해주세요.')
  } catch {
    alert(`링크를 직접 복사해주세요:\n${url}`)
  }
}
