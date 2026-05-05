/** @type {import('tailwindcss').Config} */
// Tailwind CSS 설정 - Wise 디자인 시스템 + 풀숲 테마 컬러 포함
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ─── Wise 디자인 시스템 컬러 ───────────────────────────
        wise: {
          green:         '#9fe870', // 주 CTA 버튼 배경
          'dark-green':  '#163300', // 버튼 텍스트, 딥 그린 액센트
          'light-mint':  '#e2f6d5', // 배지·소프트 서피스
          'pastel-green':'#cdffad', // 호버 액센트
          black:         '#0e0f0c', // 기본 텍스트 / 다크 배경
          'warm-dark':   '#454745', // 보조 텍스트·보더
          gray:          '#868685', // 뮤트 텍스트·플레이스홀더
          'light-surface':'#e8ebe6',// 그린 틴트 연한 서피스
        },
        // ─── 롤링페이퍼 뷰어 전용 (풀숲 테마) ──────────────────
        grass: {
          50:  '#f3faf2',
          100: '#e3f4e0',
          200: '#c6e8c0',
          300: '#9bd594',
          400: '#86c982',
          500: '#5cb054',
          600: '#3f8b3a',
          700: '#316d2f',
          800: '#28552a',
          900: '#214824',
        },
        // ─── 카네이션 포인트 (롤링페이퍼 카드 전용) ────────────
        carnation: {
          50:  '#fff1f3',
          100: '#ffe4e9',
          200: '#fecdd6',
          300: '#fda4b5',
          400: '#fb6f8e',
          500: '#f43f67',
          600: '#e11d48',
          700: '#be123c',
        },
      },
      fontFamily: {
        // GmarketSans를 기본 폰트로 사용
        sans:    ['GmarketSans', 'Apple SD Gothic Neo', 'Malgun Gothic', 'sans-serif'],
        display: ['GmarketSans', 'Apple SD Gothic Neo', 'Malgun Gothic', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
