/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gemini: {
          black: '#131314', // Container background
          deepDark: '#1e1f20', // Surface background (sidebar, chat bubbles)
          surfaceActive: '#333538', // Hover state
          border: '#2a2b2f', // Subtle borders
          text: '#e3e3e3', // Secondary text
          textPrimary: '#ffffff', // Primary text
          blueAccent: '#8ab4f8', // Accent blue
          icon: '#9aa0a6', // Icon color
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gemini.text'),
            strong: { color: theme('colors.gemini.textPrimary') },
            h1: { color: theme('colors.gemini.textPrimary') },
            code: {
              color: theme('colors.gemini.blueAccent'),
              backgroundColor: theme('colors.gemini.surfaceActive'),
              borderRadius: '0.25rem',
              padding: '0.125rem 0.25rem',
            },
            pre: {
              backgroundColor: '#282c34', // Specific code block color
              color: '#abb2bf',
            },
            // Add more specific markdown overrides here for a polished look
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
