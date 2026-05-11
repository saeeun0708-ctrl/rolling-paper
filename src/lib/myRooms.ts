/**
 * 이 기기에서 만든 롤링페이퍼 목록을 localStorage에 보관한다.
 *
 * - PIN/해시 등 민감정보는 절대 저장하지 않는다. slug 만으로는 host 페이지에
 *   접근하더라도 PIN 인증을 통과해야 하므로 안전하다.
 * - 만든이가 방을 만든 뒤 페이지를 닫아도, 첫 화면에서 다시 자기 방을 찾아
 *   host 페이지로 들어갈 수 있도록 하는 복귀 동선용 데이터다.
 */

const STORAGE_KEY = 'rp_my_rooms'

export interface MyRoom {
  /** rooms.slug — host 페이지 라우팅에 사용 */
  slug: string
  /** 받는 분 이름 (목록에서 식별용) */
  recipientName: string
  /** 만든이 이름 (목록에서 보조 표시용) */
  hostName: string
  /** ISO 문자열, 정렬·표시용 */
  createdAt: string
}

/** localStorage에서 안전하게 목록을 읽어온다. 손상된 데이터는 빈 배열로 처리. */
export function getMyRooms(): MyRoom[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // 최소 형태 검증 — slug 가 문자열인 항목만 통과
    return parsed.filter(
      (item): item is MyRoom =>
        item &&
        typeof item.slug === 'string' &&
        typeof item.recipientName === 'string' &&
        typeof item.hostName === 'string' &&
        typeof item.createdAt === 'string',
    )
  } catch {
    return []
  }
}

/** 새 방을 목록 맨 앞에 추가한다. 같은 slug 가 이미 있으면 갱신한다. */
export function addMyRoom(room: Omit<MyRoom, 'createdAt'> & { createdAt?: string }): void {
  try {
    const list = getMyRooms().filter(r => r.slug !== room.slug)
    const next: MyRoom[] = [
      {
        slug: room.slug,
        recipientName: room.recipientName,
        hostName: room.hostName,
        createdAt: room.createdAt ?? new Date().toISOString(),
      },
      ...list,
    ]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // localStorage 사용 불가 환경(시크릿 모드 등)은 조용히 무시
  }
}

/** 이 기기 목록에서 특정 방을 제거한다. (Supabase 데이터 삭제 아님) */
export function removeMyRoom(slug: string): void {
  try {
    const next = getMyRooms().filter(r => r.slug !== slug)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // 무시
  }
}
