/** @type {import('tailwindcss').Config} */
// Tailwind CSS 설정 - Figma 디자인 시스템 + 풀숲 테마 컬러 포함
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ─── Figma 디자인 시스템 컬러 ───────────────────────────
        figma: {
          ink:            '#000000', // 기본 텍스트·CTA 배경
          canvas:         '#ffffff', // 기본 페이지 배경
          'surface-soft': '#f7f7f5', // 아이콘 버튼·카드 타일 배경
          hairline:       '#e6e6e6', // 인풋·카드 보더
          'hairline-soft':'#f1f1f1', // 테이블 구분선
          // 파스텔 컬러 블록 (페이지 스토리텔링 구간)
          'block-lime':   '#dceeb1', // 시스템·FAQ·연락 섹션
          'block-lilac':  '#c5b0f4', // 디자인·FigJam 하이라이트
          'block-cream':  '#f4ecd6', // 소프트 웜 섹션
          'block-mint':   '#c8e6cd', // FigJam 파스텔
          'block-pink':   '#efd4d4', // FigJam 파스텔
          'block-coral':  '#f3c9b6', // 스토리 섹션
          'block-navy':   '#1f1d3d', // 다크 인버스 섹션
          'magenta':      '#ff3d8b', // 프로모 전용 CTA
          success:        '#1ea64a', // 성공 상태
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
          400: '#fb6f8e',
          500: '#f43f67',
          600: '#e11d48',
        },
      },
      fontFamily: {
        // 기본 UI·본문·헤딩 — Pretendard
        sans:        ['Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', 'sans-serif'],
        display:     ['Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', 'sans-serif'],
        // 메시지·따뜻한 카피·인용구 — 손글씨 톤
        handwritten: ['"Gowun Dodum"', '"Noto Serif KR"', 'serif'],
        // 시스템 모노 (아이브로우·캡션 — figmaMono 대체)
        mono:        ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
