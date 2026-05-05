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

// 배포된 OG 이미지 URL (카카오 피드 공유에 imageUrl 필수)
const OG_IMAGE_URL = `${window.location.origin}/og-meadow.svg`

/**
 * 카카오톡 피드 공유
 * SDK 미로드 또는 키 미설정 시 URL 복사로 폴백
 */
export function shareKakao(title: string, description: string, url: string): void {
  if (!window.Kakao || !KAKAO_KEY) {
    navigator.clipboard.writeText(url).catch(() => {})
    alert('카카오 키가 설정되지 않았어요.\nURL을 클립보드에 복사했어요.')
    return
  }

  initKakao()

  window.Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title,
      description,
      // imageUrl은 카카오 피드에서 필수 — 없으면 링크가 표시되지 않음
      imageUrl:    OG_IMAGE_URL,
      imageWidth:  1200,
      imageHeight: 630,
      link: { mobileWebUrl: url, webUrl: url },
    },
    buttons: [
      {
        title: '마음 보러 가기',
        link: { mobileWebUrl: url, webUrl: url },
      },
    ],
  })
}
