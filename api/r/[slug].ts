import type { VercelRequest, VercelResponse } from '@vercel/node'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? ''
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? ''
const BASE_URL     = 'https://rolling-paper-lake.vercel.app'
const OG_IMAGE     = `${BASE_URL}/og-meadow.png`

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = Array.isArray(req.query.slug) ? req.query.slug[0] : (req.query.slug ?? '')

  // Supabase REST API로 수신자 이름 조회
  let recipientName = ''
  try {
    const roomRes = await fetch(
      `${SUPABASE_URL}/rest/v1/rooms?slug=eq.${encodeURIComponent(slug)}&select=recipient_name&limit=1`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    )
    const rooms = await roomRes.json()
    recipientName = rooms[0]?.recipient_name ?? ''
  } catch {
    // 조회 실패 시 기본 OG 유지
  }

  const safeRecipient = escapeHtml(recipientName)
  const title = recipientName
    ? `${safeRecipient}에게 전하는 롤링페이퍼 | PIUM`
    : 'PIUM(피움) | 모바일 롤링페이퍼'
  const description = recipientName
    ? `${safeRecipient}에게 꽃처럼 피어나는 마음들이 모였어요. PIUM에서 확인해보세요.`
    : '소중한 사람에게 꽃처럼 피어나는 롤링페이퍼를 전달해보세요'
  const pageUrl = `${BASE_URL}/r/${slug}`

  // 배포된 index.html 가져오기
  const protocol = (req.headers['x-forwarded-proto'] as string) ?? 'https'
  const host = req.headers.host ?? 'rolling-paper-lake.vercel.app'
  let html: string
  try {
    const indexRes = await fetch(`${protocol}://${host}/index.html`)
    html = await indexRes.text()
  } catch {
    res.status(500).send('페이지 로드 오류')
    return
  }

  // OG 태그 동적 주입
  html = html
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/<meta property="og:title"[^>]*\/?>/, `<meta property="og:title" content="${title}"/>`)
    .replace(/<meta property="og:description"[^>]*\/?>/, `<meta property="og:description" content="${description}"/>`)
    .replace(/<meta property="og:image"[^>]*\/?>/, `<meta property="og:image" content="${OG_IMAGE}"/>`)
    .replace(/<meta name="twitter:title"[^>]*\/?>/, `<meta name="twitter:title" content="${title}"/>`)
    .replace(/<meta name="twitter:description"[^>]*\/?>/, `<meta name="twitter:description" content="${description}"/>`)
    .replace(/<meta name="twitter:image"[^>]*\/?>/, `<meta name="twitter:image" content="${OG_IMAGE}"/>`)
    // og:url 추가
    .replace('<!-- Open Graph -->', `<!-- Open Graph -->\n    <meta property="og:url" content="${pageUrl}"/>`)

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
  res.send(html)
}
