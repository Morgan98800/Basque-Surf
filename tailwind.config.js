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
          950: '#050a0f',
          900: '#091118',
          850: '#0f1a24',
          800: '#142230',
          750: '#1c2e40',
          700: '#253b52',
          600: '#324e6c',
          500: '#466a90',
        },
        ocean: {
          dark: '#070d13',
          card: '#0e1822',
          border: '#1b2a38',
          hover: '#142332',
        },
        wave: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // Teal Atlantique
          600: '#0d9488',
        },
        ikurrina: {
          red: '#dc2626',
          darkRed: '#991b1b',
          green: '#16a34a',
        },
        tide: {
          good: '#10b981',
          fair: '#f59e0b',
          poor: '#64748b',
          danger: '#f43f5e',
        }
      },
      fontFamily: {
        heading: ['"Outfit"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      }
    },
  },
  plugins: [],
}
