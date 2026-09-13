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
        nautical: {
          950: '#040810',
          900: '#070e18',
          850: '#0b1624',
          800: '#101e30',
          750: '#16283f',
          700: '#1e3450',
          600: '#2b496e',
          500: '#3e6594',
        },
        ikurrina: {
          red: '#c0262d',
          darkRed: '#991b1b',
          green: '#15803d',
        },
        tide: {
          good: '#10b981',
          fair: '#f59e0b',
          poor: '#64748b',
          danger: '#ef4444',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      }
    },
  },
  plugins: [],
}
