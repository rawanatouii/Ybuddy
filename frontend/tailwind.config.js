/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#05050F',
          900: '#0D0D1A',
          800: '#141428',
          700: '#1C1C38',
          600: '#252548',
        },
        gold: {
          300: '#F5D78A',
          400: '#E8C248',
          500: '#D4A017',
          600: '#B8880E',
          700: '#9A7009',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Rajdhani', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
