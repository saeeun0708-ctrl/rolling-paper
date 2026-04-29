import { useEffect } from 'react'
import { testSupabaseConnection } from './lib/supabase'

// 임시 루트 컴포넌트 - 라우팅은 이후 단계에서 추가
function App() {
  useEffect(() => {
    // 앱 시작 시 Supabase 연결 상태 확인
    testSupabaseConnection()
  }, [])

  return (
    <main className="min-h-dvh bg-grass-50 flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-grass-700">
          🌿 롤링페이퍼
        </h1>
        <p className="mt-3 text-grass-600">
          가정의 달, 마음을 담은 한 편의 풀숲
        </p>
        <p className="mt-6 text-sm text-grass-500">
          2단계: Supabase 연결 완료
        </p>
      </div>
    </main>
  )
}

export default App
