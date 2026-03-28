/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        obsidian: '#0a0a0f',
        void: '#050508',
        ember: '#ff4d1c',
        'ember-dark': '#cc3a12',
        'ember-glow': '#ff7a4d',
        platinum: '#e8e8f0',
        silver: '#9898b0',
        'surface-1': '#12121a',
        'surface-2': '#1a1a26',
        'surface-3': '#222232',
      },
      animation: {
        'pulse-ember': 'pulse-ember 2s ease-in-out infinite',
        'wave': 'wave 1.5s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-ember': {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.7, transform: 'scale(1.05)' },
        },
        'wave': {
          '0%, 100%': { transform: 'scaleY(0.5)' },
          '50%': { transform: 'scaleY(1.5)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255,77,28,0.3)' },
          '50%': { boxShadow: '0 0 60px rgba(255,77,28,0.6)' },
        },
      },
    },
  },
  plugins: [],
}
