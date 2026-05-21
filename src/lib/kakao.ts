// 카카오 / 시스템 공유 유틸
// 1순위: Kakao JS SDK (PC·모바일 모두 카카오톡으로 직행)
// 2순위: Web Share API (OS 공유 시트)
// 3순위: 클립보드 복사 폴백

declare global {
  interface Window {
    Kakao?: {
      init(key: string): void
      isInitialized(): boolean
      Share: {
        sendDefault(options: object): void
      }
    }
  }
}

const KAKAO_KEY = import.meta.env.VITE_KAKAO_KEY as string | undefined

/** Kakao SDK 초기화 — 앱 진입 시 한 번만 호출 */
export function initKakao(): void {
  if (!KAKAO_KEY || !window.Kakao) return
  if (window.Kakao.isInitialized()) return
  window.Kakao.init(KAKAO_KEY)
}

/**
 * 공유하기
 * 1) Kakao SDK 가능하면 카카오톡 공유창으로 직행
 * 2) 안 되면 Web Share API → OS 공유 시트
 * 3) 그것도 안 되면 클립보드 복사 + 안내
 */
export async function shareKakao(title: string, description: string, url: string): Promise<void> {
  // ── 1. Kakao SDK ──────────────────────────────────────────────────────────
  if (window.Kakao?.isInitialized()) {
    try {
      // 피드 템플릿: 카드(이미지·제목·설명) 어디를 탭해도 link로 이동
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title,
          description,
          imageUrl: `${window.location.origin}/og-meadow.png`,
          imageWidth: 800,
          imageHeight: 800,
          link: { mobileWebUrl: url, webUrl: url },
        },
        buttons: [
          {
            title: '롤링페이퍼 보기',
            link: { mobileWebUrl: url, webUrl: url },
          },
        ],
      })
      return
    } catch {
      // SDK 호출 실패 시 폴백 체인으로 넘어감 (도메인 미등록 등)
    }
  }

  // ── 2. Web Share API ──────────────────────────────────────────────────────
  // text 필드에 URL을 명시적으로 포함 — 카카오톡 등 일부 앱이 url 필드를 무시하기 때문
  if (navigator.share) {
    try {
      await navigator.share({ title, text: `${description}\n${url}`, url })
      return
    } catch (e) {
      // 사용자가 취소한 경우 (AbortError) 조용히 무시
      if (e instanceof Error && e.name === 'AbortError') return
    }
  }

  // ── 3. 클립보드 복사 폴백 ────────────────────────────────────────────────
  try {
    await navigator.clipboard.writeText(url)
    alert('링크를 복사했어요!\n카카오톡을 열고 원하는 대화방에 붙여넣기 해주세요.')
  } catch {
    alert(`링크를 직접 복사해주세요:\n${url}`)
  }
}
