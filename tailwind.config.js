/** @type {import('tailwindcss').Config} */
// Tailwind CSS 설정 - 풀숲 테마 컬러 팔레트 포함
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 카네이션 포인트 컬러
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
        // 풀숲 테마 기본 색상
        grass: {
          50: '#f3faf2',
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
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
