// Google Analytics 4 래퍼
// index.html에서 gtag.js를 로드하고 send_page_view:false 로 초기화한 뒤,
// SPA 라우트 변경 시점에 trackPageView()를 직접 호출한다.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

const MEASUREMENT_ID = 'G-4EVVBYSRXC'

// 현재 페이지의 page_view 이벤트를 GA4로 전송
export function trackPageView(path: string, title?: string): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: title ?? document.title,
    send_to: MEASUREMENT_ID,
  })
}

// 임의의 커스텀 이벤트 전송 (향후 메시지 작성·공유 등 트래킹용)
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', name, { ...params, send_to: MEASUREMENT_ID })
}
