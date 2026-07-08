import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // VidyaX Brand Palette
        'vx-black': '#050507',
        'vx-charcoal': '#0f1117',
        'vx-graphite': '#1a1d27',
        'vx-surface': '#232738',
        'vx-border': '#2a2e3f',
        'vx-muted': '#6b7280',
        'vx-text': '#e8eaf0',
        'vx-text-secondary': '#9ca3af',
        // Accent Colors
        'vx-purple': '#8b5cf6',
        'vx-blue': '#3b82f6',
        'vx-cyan': '#06b6d4',
        'vx-emerald': '#10b981',
      },
      keyframes: {
        'aurora-float': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(30px, -40px) scale(1.05)' },
          '50%': { transform: 'translate(-20px, 20px) scale(0.95)' },
          '75%': { transform: 'translate(40px, 30px) scale(1.03)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4', boxShadow: '0 0 20px rgba(139, 92, 246, 0.15)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(139, 92, 246, 0.3)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-in-up': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          'from': { opacity: '0', transform: 'scale(0.9)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        'spin-slow': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'aurora-float': 'aurora-float 20s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'scale-in': 'scale-in 0.5s ease-out',
        'spin-slow': 'spin-slow 20s linear infinite',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
        display: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

export default config
