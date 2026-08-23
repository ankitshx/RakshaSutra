/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        cyber: {
          bg: '#040711',
          surface: '#090e1c',
          panel: '#0d1527',
          border: 'rgba(0, 240, 255, 0.15)',
          'border-focus': 'rgba(0, 240, 255, 0.4)',
          cyan: '#00f0ff',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#ef4444',
        }
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 240, 255, 0.35)',
        'neon-emerald': '0 0 20px rgba(16, 185, 129, 0.35)',
        'neon-amber': '0 0 20px rgba(245, 158, 11, 0.35)',
        'neon-red': '0 0 25px rgba(239, 68, 68, 0.45)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ticker': 'ticker 35s linear infinite',
        'glow-scan': 'glow-scan 3s ease-in-out infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'glow-scan': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
        }
      }
    },
  },
  plugins: [],
}
