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
        // RakhshaSutra Design System (RDS 2.0) Color Architecture
        rds: {
          void: '#030508',         // Level 0: Deep Spatial Void
          canvas: '#070b12',       // Level 1: Workspace Background
          panel: '#0c121e',        // Level 2: Bastion Panel / Primary Card
          elevated: '#141d2e',     // Level 3: Elevated Component / Modal
          apex: '#1b273d',         // Level 4: Active Control / Focus Surface
          border: 'rgba(255, 255, 255, 0.08)',
          'border-subtle': 'rgba(255, 255, 255, 0.04)',
          'border-sutra': 'rgba(245, 158, 11, 0.35)',
          'border-cobalt': 'rgba(59, 130, 246, 0.35)',
          sutra: '#f59e0b',        // Signature Solar Amber / Golden Thread
          'sutra-light': '#fbbf24',// Highlight Amber
          cobalt: '#3b82f6',       // Aegis Cobalt / Defense Telemetry
          'cobalt-light': '#60a5fa',
          jade: '#10b981',         // Verified / Encrypted / Hardened
          'jade-light': '#34d399',
          ochre: '#f97316',        // Advisory / Attention Required
          ruby: '#f43f5e',         // Hostile Threat / Critical Intercept
          'ruby-light': '#fb7185',
          text: '#f8fafc',         // Titanium Slate 50
          muted: '#94a3b8',        // Slate 400
          dim: '#475569',          // Slate 600
        },
        // Backward-compatible cyber palette mapping to RDS tokens
        cyber: {
          bg: '#030508',
          surface: '#070b12',
          card: '#0c121e',
          panel: '#0c121e',
          elevated: '#141d2e',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-subtle': 'rgba(255, 255, 255, 0.04)',
          'border-focus': 'rgba(245, 158, 11, 0.45)',
          cyan: '#f59e0b',
          blue: '#3b82f6',
          emerald: '#10b981',
          amber: '#f97316',
          rose: '#f43f5e',
          muted: '#94a3b8',
        }
      },
      boxShadow: {
        'rds-panel': '0 8px 32px 0 rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        'rds-elevated': '0 16px 48px -8px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        'sutra-glow': '0 0 25px -4px rgba(245, 158, 11, 0.25)',
        'cobalt-glow': '0 0 25px -4px rgba(59, 130, 246, 0.25)',
        'ruby-glow': '0 0 25px -4px rgba(244, 63, 94, 0.25)',
        'jade-glow': '0 0 25px -4px rgba(16, 185, 129, 0.25)',
        'subtle-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'elevated-card': '0 10px 30px -5px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
        'neon-cyan': '0 0 15px rgba(245, 158, 11, 0.25)',
        'neon-emerald': '0 0 15px rgba(16, 185, 129, 0.25)',
        'neon-amber': '0 0 15px rgba(249, 115, 22, 0.25)',
        'neon-rose': '0 0 15px rgba(244, 63, 94, 0.25)',
        'glass-panel': '0 8px 32px 0 rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ticker': 'ticker 35s linear infinite',
        'glow-scan': 'glow-scan 3s ease-in-out infinite',
        'sutra-pulse': 'sutra-pulse 2.5s ease-in-out infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'glow-scan': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.02)' },
        },
        'sutra-pulse': {
          '0%, 100%': { opacity: '0.4', filter: 'drop-shadow(0 0 2px rgba(245,158,11,0.3))' },
          '50%': { opacity: '0.9', filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.6))' }
        }
      }
    },
  },
  plugins: [],
}
