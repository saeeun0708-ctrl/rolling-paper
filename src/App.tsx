import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { testSupabaseConnection } from './lib/supabase'
import CreateRoomPage     from './features/room-create/CreateRoomPage'
import CreateRoomAuthPage from './features/room-create/CreateRoomAuthPage'
import SharePage          from './features/room-create/SharePage'
import WriteMessagePage  from './features/message-write/WriteMessagePage'
import HostPage          from './features/host-dashboard/HostPage'
import ViewerPage        from './features/viewer/ViewerPage'
import Terms             from './pages/Terms'
import Privacy           from './pages/Privacy'
import FindMyRoomsPage   from './pages/FindMyRoomsPage'

function App() {
  useEffect(() => {
    // 앱 시작 시 Supabase 연결 상태 확인
    testSupabaseConnection()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* 방 만들기 1단계 — 받는 분/내 이름 */}
        <Route path="/create"          element={<CreateRoomPage />} />
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
