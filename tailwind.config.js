/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        coral: { 50: '#FAECE7', 100: '#F5C4B3', 200: '#F0997B', 400: '#D85A30', 500: '#C24E28', 600: '#993C1D', 800: '#712B13' },
        amber: { 50: '#FAEEDA', 200: '#FAC775', 400: '#EF9F27', 600: '#BA7517', 800: '#854F0B' },
        sage: { 50: '#EAF3DE', 200: '#C0DD97', 400: '#639922', 600: '#3B6D11', 800: '#27500A' },
        sky: { 50: '#E6F1FB', 200: '#B5D4F4', 400: '#378ADD', 600: '#185FA5', 800: '#0C447C' },
        danger: { 50: '#FCEBEB', 200: '#F7C1C1', 400: '#E24B4A', 600: '#A32D2D', 800: '#791F1F' },
        warm: { 50: '#F9F8F6', 100: '#F1EFE8', 200: '#D3D1C7', 300: '#B8B7B0', 400: '#888780', 600: '#5F5E5A', 800: '#2C2C2A' },
        // Role-tinted signup accents — vivid editorial greens/blues that sit
        // alongside the existing sage/sky scales (deeper, utility-focused).
        cleanerAccent:  { 400: '#2F7A3F', 500: '#1F5428' },
        teammateAccent: { 400: '#2F6BBD', 500: '#1F538E' },
        // Settings redesign — semantic tokens from design_handoff_settings_redesign spec.
        // Scoped by convention to Settings surfaces + global chrome (Sidebar, BottomNav,
        // MobileHeader). Do not leak into non-Settings pages.
        ink:          '#1F1D1A',
        ink2:         '#2C2A26',
        'bg-page':    '#F9F8F6',
        'bg-surface': '#FFFFFF',
        'bg-subtle':  '#F1EFE8',
        'border-base':'#E4DFD3',
        'border-soft':'#EDEAE0',
        'text-base':  '#2C2C2A',
        'text-muted': '#5F5B52',
        'text-subtle':'#888780',
        'text-faint': '#B4AD9A',
        'coral-brand':'#D85A30',
        'coral-brand-hover':'#C24E28',
        'coral-soft': '#FAECE7',
        'coral-soft-border':'#F5C4B3',
        'coral-deep': '#712B13',
        'sage-brand': '#3F8F2F',
        'danger-brand':'#C24437',
        'danger-soft':'#FCEBEB',
        'danger-soft-border':'#F0C8C4',
        'danger-soft-bg':'#FEF7F5',
        'danger-soft-divider':'#F5D9D5',
        'danger-deep':'#7B1D17',
        'row-accent': '#FEFCF6',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
        // Scoped — apply via `font-inter` on Settings redesign surfaces only.
        inter: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        pill: '20px',
        lg: '8px',
        md: '6px',
        sm: '4px',
        card: '14px',
        hero: '16px',
        tile: '10px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(44,44,42,0.04)',
        toast: '0 10px 28px rgba(0,0,0,0.22)',
        'desktop-frame': '0 20px 60px -20px rgba(0,0,0,.15), 0 4px 12px -6px rgba(0,0,0,.08)',
      },
      minHeight: { touch: '44px' },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
