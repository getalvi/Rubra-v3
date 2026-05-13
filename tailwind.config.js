/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'monospace'],
      },
      colors: {
        // Brand
        brand: {
          DEFAULT: '#c0392b',
          dark:    '#96281b',
          glow:    'rgba(192,57,43,0.35)',
          subtle:  'rgba(192,57,43,0.12)',
          faint:   'rgba(192,57,43,0.06)',
        },
        // Glass surfaces
        glass: {
          1: 'rgba(255,255,255,0.022)',
          2: 'rgba(255,255,255,0.048)',
          3: 'rgba(255,255,255,0.075)',
          4: 'rgba(255,255,255,0.110)',
          border: 'rgba(255,255,255,0.07)',
          'border-2': 'rgba(255,255,255,0.12)',
        },
        // Background shades
        bg: {
          base:    '#060606',
          surface: '#0c0c0c',
          raised:  '#111111',
        },
        // Text
        ink: {
          primary:   'rgba(255,255,255,0.92)',
          secondary: 'rgba(255,255,255,0.52)',
          tertiary:  'rgba(255,255,255,0.28)',
          code:      '#f5b8b3',
        },
      },
      backdropBlur: {
        glass: '28px',
        heavy: '48px',
      },
      borderWidth: {
        '0.5': '0.5px',
      },
      animation: {
        'fade-up':      'fadeUp 0.22s cubic-bezier(.4,0,.2,1) both',
        'slide-left':   'slideLeft 0.22s cubic-bezier(.4,0,.2,1) both',
        'pulse-dot':    'pulseDot 1.4s ease-in-out infinite',
        'typing-dot':   'typingDot 1.2s ease-in-out infinite',
        'cursor-blink': 'cursorBlink 1s step-end infinite',
        'spin-slow':    'spin 1.6s linear infinite',
      },
      keyframes: {
        fadeUp:      { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideLeft:   { from: { opacity: '0', transform: 'translateX(-10px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        pulseDot:    { '0%,100%': { boxShadow: '0 0 0 0 rgba(192,57,43,0.45)' }, '50%': { boxShadow: '0 0 0 5px rgba(192,57,43,0)' } },
        typingDot:   { '0%,80%,100%': { transform: 'scale(0.65)', opacity: '.35' }, '40%': { transform: 'scale(1)', opacity: '1' } },
        cursorBlink: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0' } },
      },
      boxShadow: {
        glass:    '0 4px 32px rgba(0,0,0,0.55), inset 0 0.5px 0 rgba(255,255,255,0.1)',
        'glass-sm': '0 2px 12px rgba(0,0,0,0.4)',
        brand:    '0 0 28px rgba(192,57,43,0.22), 0 0 64px rgba(192,57,43,0.09)',
        'send':   '0 2px 14px rgba(192,57,43,0.45)',
      },
    },
  },
  plugins: [],
}
