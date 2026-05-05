// 꽃 셰이프 타입 및 관련 상수

export type FlowerShape = 'carnation' | 'daisy' | 'tulip' | 'clover' | 'star'

export const FLOWER_SHAPES: FlowerShape[] = ['carnation', 'daisy', 'tulip', 'clover', 'star']

export const FLOWER_EMOJIS: Record<FlowerShape, string> = {
  carnation: '🌸',
  daisy:     '🌼',
  tulip:     '🌷',
  clover:    '🍀',
  star:      '⭐',
}

export const FLOWER_LABELS: Record<FlowerShape, string> = {
  carnation: '카네이션',
  daisy:     '데이지',
  tulip:     '튤립',
  clover:    '클로버',
  star:      '별',
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
