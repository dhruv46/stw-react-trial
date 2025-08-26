/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefaff",
          100: "#d6f0ff",
          200: "#aee0ff",
          300: "#7bcaff",
          400: "#48b0ff",
          500: "#1f96ff",
          600: "#0e75db",
          700: "#095db0",
          800: "#094f8e",
          900: "#0b416f"
        }
      },
      boxShadow: {
        soft: "0 8px 24px rgba(0,0,0,0.08)"
      }
    }
  },
  plugins: []
}