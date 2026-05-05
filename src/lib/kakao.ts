// 카카오 SDK 타입 선언
declare global {
  interface Window {
    Kakao: {
      init(key: string): void
      isInitialized(): boolean
      Share: {
        sendDefault(options: object): void
      }
    }
  }
}

const KAKAO_KEY = import.meta.env.VITE_KAKAO_KEY as string | undefined

/** 카카오 SDK 초기화 (중복 호출 방지) */
export function initKakao(): void {
  if (!KAKAO_KEY || !window.Kakao) return
  if (window.Kakao.isInitialized()) return
  window.Kakao.init(KAKAO_KEY)
}

/**
 * 카카오톡 공유
 * 1순위: 카카오 SDK (text 타입, URL을 텍스트에 직접 포함 → 카카오톡이 링크 미리보기 자동 생성)
 * 2순위: Web Share API (모바일 기본 공유 시트)
 * 3순위: 클립보드 복사
 */
export function shareKakao(title: string, description: string, url: string): void {
  // ── 1. 카카오 SDK ─────────────────────────────────────────────────────────
  if (window.Kakao && KAKAO_KEY) {
    initKakao()
    try {
      window.Kakao.Share.sendDefault({
        objectType: 'text',
        // URL을 텍스트에 직접 포함 → 카카오톡이 URL 인식 후 링크 미리보기 생성
        text: `🌸 ${title}\n${description}\n\n${url}`,
        link: {
          mobileWebUrl: url,
          webUrl:       url,
        },
      })
      return
    } catch (e) {
      console.warn('카카오 공유 실패, Web Share API로 폴백:', e)
    }
  }

  // ── 2. Web Share API (모바일 카카오톡 앱 등 선택 가능) ─────────────────
  if (navigator.share) {
    navigator.share({ title, text: description, url }).catch(() => {
      copyFallback(url)
    })
    return
  }

  // ── 3. 클립보드 복사 폴백 ─────────────────────────────────────────────────
  copyFallback(url)
}

function copyFallback(url: string) {
  navigator.clipboard.writeText(url).catch(() => {})
  alert('링크를 클립보드에 복사했어요! 카카오톡에 직접 붙여넣기 해주세요.')
}
