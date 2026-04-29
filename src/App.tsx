import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { testSupabaseConnection } from './lib/supabase'
import CreateRoomPage from './features/room-create/CreateRoomPage'
import SharePage      from './features/room-create/SharePage'

function App() {
  useEffect(() => {
    // 앱 시작 시 Supabase 연결 상태 확인
    testSupabaseConnection()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* 방 만들기 */}
        <Route path="/create"          element={<CreateRoomPage />} />
        {/* 링크 공유 페이지 */}
        <Route path="/r/:slug/share"   element={<SharePage />} />
        {/* 루트 → 방 만들기로 리다이렉트 */}
        <Route path="/"                element={<Navigate to="/create" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
