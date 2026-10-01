/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1c2b3a',
        paper: '#f7f5f0',
        gold: '#c9a227',
        'gold-dark': '#8a6d1a',
        green: '#2f6f3a',
        red: '#b0413e',
        line: '#d8d2c4',
        'line-strong': '#8e8a81',
        muted: '#5d6472',
      },
      fontFamily: {
        // Public Sans for reading; Bricolage Grotesque for headings.
        // System fonts stay as the fallback so text shows instantly on slow data.
        sans: ['"Public Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['"Bricolage Grotesque"', '"Public Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 10px rgba(0,0,0,.06)',
        lift: '0 8px 24px rgba(28,43,58,.10)',
      },
    },
  },
  plugins: [],
}
