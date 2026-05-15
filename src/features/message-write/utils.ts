// 꽃 셰이프 타입 및 관련 상수

export type FlowerShape = 'carnation' | 'daisy' | 'tulip' | 'clover' | 'sunflower'

export const FLOWER_SHAPES: FlowerShape[] = ['carnation', 'daisy', 'tulip', 'clover', 'sunflower']

export const FLOWER_EMOJIS: Record<FlowerShape, string> = {
  carnation:  '🌸',
  daisy:      '🌼',
  tulip:      '🌷',
  clover:     '🍀',
  sunflower:  '🌻',
}

export const FLOWER_LABELS: Record<FlowerShape, string> = {
  carnation:  '벚꽃',
  daisy:      '데이지',
  tulip:      '튤립',
  clover:     '클로버',
  sunflower:  '해바라기',
}

export function randomFlower(): FlowerShape {
  return FLOWER_SHAPES[Math.floor(Math.random() * FLOWER_SHAPES.length)]
}

// ─── localStorage 관련 ────────────────────────────────────────────────────

export interface StoredAuthor {
  token: string
  name: string
  messageId: string
  body: string
  shape: FlowerShape
}

const PREFIX = 'rp_author_'

export function getStoredAuthor(slug: string): StoredAuthor | null {
  try {
    const raw = localStorage.getItem(`${PREFIX}${slug}`)
    return raw ? (JSON.parse(raw) as StoredAuthor) : null
  } catch {
    return null
  }
}

export function storeAuthor(slug: string, data: StoredAuthor): void {
  localStorage.setItem(`${PREFIX}${slug}`, JSON.stringify(data))
}

export function removeStoredAuthor(slug: string): void {
  localStorage.removeItem(`${PREFIX}${slug}`)
}

export function generateToken(): string {
  return crypto.randomUUID()
}

// ─── 다중 메시지 localStorage ─────────────────────────────────────────────
const MULTI_PREFIX = 'rp_authors_'

/** 이 기기에서 해당 롤링페이퍼에 작성한 메시지 목록 반환 (구버전 단일 형식 호환) */
export function getStoredAuthorsList(slug: string): StoredAuthor[] {
  try {
    const raw = localStorage.getItem(`${MULTI_PREFIX}${slug}`)
    const list: StoredAuthor[] = raw ? (JSON.parse(raw) as StoredAuthor[]) : []

    // 구버전 단일 키에 있는 메시지가 목록에 없으면 병합 (누락 방지)
    const single = getStoredAuthor(slug)
    if (single && !list.some(s => s.messageId === single.messageId)) {
      const merged = [single, ...list]
      localStorage.setItem(`${MULTI_PREFIX}${slug}`, JSON.stringify(merged))
      return merged
    }
    return list
  } catch { return [] }
}

/** 메시지 목록을 저장하고, 구버전 단일 키도 최신 항목으로 동기화 */
export function storeAuthorsList(slug: string, list: StoredAuthor[]): void {
  localStorage.setItem(`${MULTI_PREFIX}${slug}`, JSON.stringify(list))
  // ViewerPage 등 getStoredAuthor를 쓰는 곳을 위해 최신 1건도 유지
  if (list.length > 0) storeAuthor(slug, list[list.length - 1])
  else removeStoredAuthor(slug)
}

// ─── 프롬프트 카드 ────────────────────────────────────────────────────────

export const ALL_PROMPTS = [
  '최근 가장 고마웠던 순간은?',
  '○○ 하면 떠오르는 장면 한 컷은?',
  '꼭 전하고 싶었는데 못 했던 한마디는?',
  '함께한 시간 중 가장 기억에 남는 순간은?',
  '앞으로 함께 하고 싶은 한 가지는?',
]

/** 5개 중 n개를 랜덤으로 섞어 반환 */
export function pickRandomPrompts(n: number, recipientName: string): string[] {
  const shuffled = [...ALL_PROMPTS].sort(() => Math.random() - 0.5)
  return shuffled
    .slice(0, n)
    .map(p => p.replace('○○', recipientName || '받는 분'))
}
