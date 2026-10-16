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
        auto: {
          bg: '#0c0f17',
          surface: '#151b28',
          card: '#1b2334',
          accent: '#3b82f6',
          accentHover: '#2563eb',
          amber: '#f59e0b',
          crimson: '#ef4444',
          emerald: '#10b981',
          textMuted: '#94a3b8'
        }
      },
      fontFamily: {
        automotive: ['Roboto', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
}
