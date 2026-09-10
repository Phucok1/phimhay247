/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cinema: {
          950: '#07080a',
          900: '#0c0e14',
          850: '#11141d',
          800: '#171b26',
          700: '#222838',
          600: '#323b52',
          500: '#4d5978',
        },
        primary: {
          DEFAULT: '#e50914',
          hover: '#f40612',
          glow: 'rgba(229, 9, 20, 0.4)'
        },
        gold: {
          DEFAULT: '#f59e0b',
          hover: '#d97706',
          glow: 'rgba(245, 158, 11, 0.4)'
        }
      },
      aspectRatio: {
        '2/3': '2 / 3',
        '16/9': '16 / 9'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
