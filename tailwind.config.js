/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        coral: { 50: '#FAECE7', 100: '#F5C4B3', 200: '#F0997B', 400: '#D85A30', 600: '#993C1D', 800: '#712B13' },
        amber: { 50: '#FAEEDA', 200: '#FAC775', 400: '#EF9F27', 600: '#BA7517', 800: '#854F0B' },
        sage: { 50: '#EAF3DE', 200: '#C0DD97', 400: '#639922', 600: '#3B6D11', 800: '#27500A' },
        sky: { 50: '#E6F1FB', 200: '#B5D4F4', 400: '#378ADD', 600: '#185FA5', 800: '#0C447C' },
        danger: { 50: '#FCEBEB', 200: '#F7C1C1', 400: '#E24B4A', 600: '#A32D2D', 800: '#791F1F' },
        warm: { 50: '#F9F8F6', 100: '#F1EFE8', 200: '#D3D1C7', 400: '#888780', 600: '#5F5E5A', 800: '#2C2C2A' },
      },
      fontFamily: { sans: ['Manrope', 'sans-serif'] },
      borderRadius: { pill: '20px' },
      minHeight: { touch: '44px' },
    },
  },
  plugins: [],
}
