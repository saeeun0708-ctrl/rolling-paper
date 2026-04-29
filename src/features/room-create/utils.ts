// 브라우저 내장 crypto API를 사용한 추측 불가능한 랜덤 문자열 생성

const SLUG_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789'
const KEY_CHARS  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

/** 작성용 URL slug 생성 (소문자+숫자 10자) */
export function generateSlug(length = 10): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes).map(b => SLUG_CHARS[b % SLUG_CHARS.length]).join('')
}

/** 열람용 open_key 생성 (대소문자+숫자 16자) */
export function generateOpenKey(length = 16): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes).map(b => KEY_CHARS[b % KEY_CHARS.length]).join('')
}
