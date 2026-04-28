/** @type {import('tailwindcss').Config} */
// Tailwind CSS 설정 - 풀숲 테마 컬러 팔레트 포함
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 풀숲 테마 기본 색상 (이후 단계에서 확장)
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
