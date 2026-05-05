/**
 * 한글 욕설 필터 사전
 * 단어를 추가하려면 PROFANITY_LIST 배열에 문자열을 넣으면 됩니다.
 */
export const PROFANITY_LIST: string[] = [
  '씨발', '씨바', '시발', '시바', 'ㅅㅂ',
  '개새끼', '개세끼', 'ㄱㅅㄲ',
  '병신', 'ㅂㅅ',
  '지랄', 'ㅈㄹ',
  '미친놈', '미친년',
  '꺼져', '뒤져', '죽어',
  '창녀', '보지', '자지',
]

/**
 * 텍스트에 욕설이 포함되어 있는지 확인합니다.
 * 공백을 제거하고 소문자로 정규화해서 비교합니다.
 */
export function containsProfanity(text: string): boolean {
  const normalized = text.replace(/\s/g, '').toLowerCase()
  return PROFANITY_LIST.some(word => normalized.includes(word))
}
