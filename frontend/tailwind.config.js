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
        pulse: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        civic: {
          navy: '#0f172a',
          dark: '#0b0f19',
          card: '#131b2e',
          border: '#1e293b',
          accent: '#38bdf8',
        },
        risk: {
          low: '#10b981',
          moderate: '#f59e0b',
          high: '#f97316',
          critical: '#ef4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-low': '0 0 15px rgba(16, 185, 129, 0.25)',
        'glow-mod': '0 0 15px rgba(245, 158, 11, 0.25)',
        'glow-high': '0 0 15px rgba(249, 115, 22, 0.25)',
        'glow-crit': '0 0 20px rgba(239, 68, 68, 0.35)',
      }
    },
  },
  plugins: [],
}
