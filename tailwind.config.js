/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Syne", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        bg:      "#0a0a0f",
        surface: "#111118",
        border:  "#1e1e2e",
        accent:  "#e8301f",
      },
    },
  },
  plugins: [],
};
