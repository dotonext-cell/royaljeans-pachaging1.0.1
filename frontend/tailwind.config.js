/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'Tahoma', 'sans-serif'],
      },
      colors: {
        bg: {
          primary: '#0b0f1a',
          secondary: '#111827',
          card: 'rgba(17, 24, 39, 0.8)',
          hover: 'rgba(255,255,255,0.04)',
        },
        text: {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
          muted: '#475569',
        },
        accent: {
          gold: '#f59e0b',
          'gold-light': '#fbbf24',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          green: '#10b981',
          red: '#ef4444',
          orange: '#f97316',
        },
        border: {
          base: 'rgba(255,255,255,0.06)',
          light: 'rgba(255,255,255,0.12)',
        },
      },
    },
  },
  plugins: [],
}
