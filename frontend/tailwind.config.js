/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class', // ✅ enables dark mode support using class strategy
  theme: {
    extend: {
      keyframes: {
        fade: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fade: 'fade 0.3s ease-in-out',
      },
    },
  },
  plugins: [],
};
