/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#e9edff',
          100: '#cfd7ff',
          200: '#a3b2ff',
          300: '#748cff',
          400: '#4464ff',
          500: '#1f42e0',
          600: '#132fb7',
          700: '#0f2699',
          800: '#0d217f',
          900: '#09185f',
        },
        accent: {
          50: '#fff1ee',
          100: '#ffd9d0',
          200: '#ffb7a5',
          300: '#ff8a70',
          400: '#ff5f3e',
          500: '#f24420',
          600: '#dc3010',
          700: '#b9270d',
          800: '#971f0f',
          900: '#7c1d11',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 12px 45px -14px rgba(15, 38, 153, 0.28), 0 4px 15px -3px rgba(185, 39, 13, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
