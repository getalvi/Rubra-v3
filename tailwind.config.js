/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Gemini-inspired color palette
        gemini: {
          bg: '#131314',
          surface: '#1e1f20',
          surfaceHover: '#28292a',
          border: 'rgba(255, 255, 255, 0.1)',
          text: '#e3e3e3',
          textMuted: '#9aa0a6',
          blue: '#8ab4f8',
        }
      },
      fontFamily: {
        sans: ['Google Sans', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.4s ease',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
module.exports = {
  theme: {
    extend: {
      colors: {
        gemini: {
          bg: '#131314',      // Main background
          surface: '#1e1f20', // Sidebar & Input box
          text: '#e3e3e3',    // Primary text
          accent: '#a8c7fa',  // Accent for buttons
        }
      }
    }
  }
}
