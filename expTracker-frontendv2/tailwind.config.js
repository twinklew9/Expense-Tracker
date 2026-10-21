/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", /* Standard React/Vite path */
    "./src/**/*"                   /* Catch-all for any folder structure */
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}