import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initKakao } from './lib/kakao'

// 카카오 SDK 초기화 (PC/모바일 공유에 사용)
initKakao()

// 앱 진입점
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
