/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        garmin: {
          blue: '#007dba',
          dark: '#1a1a2e',
          light: '#16213e',
          accent: '#0f3460',
          success: '#22c55e',
          warning: '#f59e0b',
          danger: '#ef4444'
        }
      }
    },
  },
  plugins: [],
}
