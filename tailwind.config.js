/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './**/*.{ts,tsx}',
    '!./node_modules/**',
    '!./dist/**',
    '!./api/**',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'studio-bg': '#050505',
        'studio-panel': '#1E1F20',
        'studio-border': '#444746',
        'studio-primary': '#E2E2E8',
        'studio-text': '#E3E3E3',
        'studio-text-dim': '#94A3B8',
        'soul': {
          DEFAULT: '#E2E2E8',
          glow: '#C8C8D0',
          dim: '#1A1A2E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'breathe': 'breathe 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'glow-ring': 'glow-ring 4s ease-in-out infinite',
        'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(5px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.3)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'glow-ring': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(226,226,232,0)' },
          '50%': { boxShadow: '0 0 20px -4px rgba(226,226,232,0.15)' },
        },
      },
    },
  },
  plugins: [],
};
