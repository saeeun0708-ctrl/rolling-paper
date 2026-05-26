import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { testSupabaseConnection } from './lib/supabase'
import { trackPageView, resolvePageTitle } from './lib/analytics'
import CreateRoomPage     from './features/room-create/CreateRoomPage'
import CreateRoomAuthPage from './features/room-create/CreateRoomAuthPage'
import SharePage          from './features/room-create/SharePage'
import WriteMessagePage  from './features/message-write/WriteMessagePage'
import HostPage          from './features/host-dashboard/HostPage'
import ViewerPage        from './features/viewer/ViewerPage'
import Terms             from './pages/Terms'
import Privacy           from './pages/Privacy'
import FindMyRoomsPage   from './pages/FindMyRoomsPage'
import MeadowTestPage    from './pages/MeadowTestPage'
import ShowcaseTeacherPage from './pages/ShowcaseTeacherPage'

// 라우트 변경마다 GA4 page_view 전송
// page_title을 화면별 한국어 이름으로 보내, GA 보고서에서 화면 단위로 묶여 보이게 한다.
function RouteTracker() {
  const location = useLocation()
  useEffect(() => {
    const title = resolvePageTitle(location.pathname)
    // 브라우저 탭 제목도 화면 이름을 앞에 붙여 노출 (브랜드는 뒤로)
    document.title = `${title} · PIUM`
    trackPageView(location.pathname + location.search, title)
  }, [location.pathname, location.search])
  return null
}

function App() {
  useEffect(() => {
    // 앱 시작 시 Supabase 연결 상태 확인
    testSupabaseConnection()
  }, [])

  return (
    <BrowserRouter>
      <RouteTracker />
      <Routes>
        {/* 방 만들기 1단계 — 받는 분/내 이름 */}
        <Route path="/create"          element={<CreateRoomPage />} />
        {/* 방 만들기 1단계 — 폼 단독 화면 (이 기기 목록이 있어도 새로 만들기 동선 분리) */}
        <Route path="/create/new"      element={<CreateRoomPage key="new" forceFormOnly />} />
        {/* 방 만들기 2단계 — 이메일·비밀번호 (1단계에서 router state로 진입) */}
        <Route path="/create/auth"     element={<CreateRoomAuthPage />} />
        {/* 내 롤링페이퍼 찾기 (이메일로 조회) */}
        <Route path="/my-rooms"        element={<FindMyRoomsPage />} />
        {/* 링크 공유 페이지 */}
        <Route path="/r/:slug/share"   element={<SharePage />} />
        {/* 메시지 작성 페이지 */}
        <Route path="/r/:slug"         element={<WriteMessagePage />} />
        {/* 만든이 페이지 */}
        <Route path="/r/:slug/host"    element={<HostPage />} />
        {/* 받는 분 열람 페이지 */}
        <Route path="/r/:slug/open"    element={<ViewerPage />} />
        {/* 만든이 미리보기 — 받는 분과 같은 UI, 포장 검증·애니메이션 생략 */}
        <Route path="/r/:slug/preview" element={<ViewerPage isPreview />} />
        {/* dev 전용 — mock 데이터로 풀숲 미리보기 (?n=40 형태로 개수 조절) */}
        <Route path="/dev/meadow-test" element={<MeadowTestPage />} />
        {/* 홍보 영상용 showcase — 10대 학생 14명이 선생님께 쓴 롤링페이퍼 */}
        <Route path="/showcase/teacher" element={<ShowcaseTeacherPage />} />
        {/* 법적 고지 */}
        <Route path="/terms"           element={<Terms />} />
        <Route path="/privacy"         element={<Privacy />} />
        {/* 루트 → 방 만들기로 리다이렉트 */}
        <Route path="/"                element={<Navigate to="/create" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
