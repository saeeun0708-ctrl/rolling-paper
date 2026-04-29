import { createClient } from '@supabase/supabase-js'

// 환경 변수에서 Supabase 접속 정보 로드
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '.env 파일에 VITE_SUPABASE_URL 과 VITE_SUPABASE_ANON_KEY 를 설정해주세요.'
  )
}

// Supabase 클라이언트 싱글톤
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Supabase 연결 상태를 확인하는 간단한 테스트 함수.
 * rooms 테이블에 count 쿼리를 날려 응답 여부를 확인한다.
 */
export async function testSupabaseConnection(): Promise<void> {
  const { error } = await supabase.from('rooms').select('id', { count: 'exact', head: true })

  if (error) {
    // 테이블이 아직 없는 경우(PGRST116)도 서버 자체는 연결된 것이므로 성공 처리
    if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
      console.log('✅ Supabase 연결 성공 (테이블은 아직 생성 전)')
      return
    }
    console.error('❌ Supabase 연결 실패:', error.message)
    return
  }

  console.log('✅ Supabase 연결 성공')
}
