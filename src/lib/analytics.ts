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
// send_to는 단일 GA4 속성에서 measurement ID로 지정하면 이벤트가 전송되지 않는
// 케이스가 있어 생략한다. (gtag('config', ID)에서 이미 기본 타겟이 정해진다.)
export function trackPageView(path: string, title?: string): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: title ?? document.title,
  })
}

// 임의의 커스텀 이벤트 전송 (향후 메시지 작성·공유 등 트래킹용)
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', name, params)
}

// 현재 URL에 대응하는 사람이 읽기 좋은 화면 이름을 반환한다.
// GA4 "페이지 제목" 컬럼이 화면별로 묶여 보이게 하는 목적.
// /r/:slug 같은 동적 path는 끝부분 매칭으로 구분한다.
export function resolvePageTitle(pathname: string): string {
  if (pathname === '/' || pathname === '/create')   return '방 만들기 1단계'
  if (pathname === '/create/new')                    return '방 만들기 1단계 (새로)'
  if (pathname === '/create/auth')                   return '방 만들기 2단계 (이메일·비밀번호)'
  if (pathname === '/my-rooms')                      return '내 롤링페이퍼 찾기'
  if (pathname === '/terms')                         return '이용약관'
  if (pathname === '/privacy')                       return '개인정보 처리방침'
  if (pathname === '/dev/meadow-test')               return 'dev 풀숲 미리보기'

  // /r/:slug 계열 — 더 구체적인 suffix를 먼저 매칭한 뒤 기본은 메시지 작성
  if (pathname.startsWith('/r/')) {
    if (pathname.endsWith('/share'))    return '공유 페이지'
    if (pathname.endsWith('/host'))     return '주최자 대시보드'
    if (pathname.endsWith('/open'))     return '받는 분 열람'
    if (pathname.endsWith('/preview'))  return '주최자 미리보기'
    return '메시지 작성'
  }

  // 매칭 실패 시 기본 폴백 — 새 라우트 추가했는데 매핑을 안 넣은 경우를 식별 가능
  return 'PIUM (기타)'
}

// MEASUREMENT_ID 변수는 향후 디버깅 로깅 등에서 참고할 수 있도록 export 유지
export { MEASUREMENT_ID }
