/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ДОБАВЛЕНО: Точные размеры шрифтов из вашей таблицы 8K
      fontSize: {
        'h1-size': '96px', // H1
        'h2-size': '72px', // H2
        'h3-size': '56px', // H3
        'h4-size': '40px', // H4
        'p-size':  '28px', // Paragraph, Input
        'btn-size': '40px', // Button
      },
      // ДОБАВЛЕНО: Точные значения line-height и letter-spacing
      lineHeight: {
        'h1-lh': '108px',
        'h2-lh': '82px',
        'h3-lh': '66px',
        'p-lh':  '38px',
        'input-lh': '32px',
        'btn-lh': '40px',
      },
      letterSpacing: {
        'h1-ls': '-1px',
        'h2-ls': '-0.75px',
        'h3-ls': '-0.6px',
        'btn-ls': '2px',
      }
    },
  },
  plugins: [],
}