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
        ios: {
          bg: '#000000',
          elevated: '#121214',
          card: 'rgba(255, 255, 255, 0.07)',
          cardHover: 'rgba(255, 255, 255, 0.11)',
          border: 'rgba(255, 255, 255, 0.12)',
          separator: 'rgba(255, 255, 255, 0.08)',
          blue: '#007AFF',
          blueHover: '#0062cc',
          green: '#34C759',
          yellow: '#FFCC00',
          orange: '#FF9500',
          red: '#FF3B30',
          teal: '#30B0C7',
          label: '#FFFFFF',
          secondary: '#8E8E93',
          tertiary: '#48484A',
        },
        ikurrina: {
          red: '#dc2626',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          'system-ui',
          'sans-serif'
        ],
        display: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          'system-ui',
          'sans-serif'
        ],
        mono: [
          '"SF Mono"',
          'ui-monospace',
          'monospace'
        ],
      }
    },
  },
  plugins: [],
}
