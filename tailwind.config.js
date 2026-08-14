/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        // H1: 28–32px, SemiBold, line-height 1.2, letter-spacing -0.2px
        'headline-lg': ['30px', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '-0.2px' }],
        // H2: 22–24px, SemiBold, line-height 1.2, letter-spacing -0.2px
        'headline-md': ['22px', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '-0.2px' }],
        // H3: 18–20px, SemiBold, line-height 1.2, letter-spacing -0.2px
        'headline-sm': ['18px', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '-0.2px' }],
        // Body large: 16px, Regular, line-height 1.5
        'body-lg': ['16px', { lineHeight: '1.5', fontWeight: '400', letterSpacing: '-0.2px' }],
        // Body: 14–16px, Regular, line-height 1.5
        'body-md': ['14px', { lineHeight: '1.5', fontWeight: '400', letterSpacing: '-0.2px' }],
        // Body small / data kecil: 13px, Regular, line-height 1.5
        'body-sm': ['13px', { lineHeight: '1.5', fontWeight: '400', letterSpacing: '-0.2px' }],
        // Label / data angka: 12px, Medium, line-height 1.2
        'label-md': ['12px', { lineHeight: '1.2', letterSpacing: '-0.1px', fontWeight: '500' }],
        // Data angka besar (KPI values): 24px, Medium
        'data-lg': ['24px', { lineHeight: '1.2', fontWeight: '500', letterSpacing: '-0.3px' }],
        // Data angka medium: 18px, Medium
        'data-md': ['18px', { lineHeight: '1.2', fontWeight: '500', letterSpacing: '-0.2px' }],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'text-fade': {
          '0%': { opacity: '0', filter: 'blur(4px)' },
          '100%': { opacity: '1', filter: 'blur(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.55s ease-out both',
        'fade-up': 'fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both',
        'text-fade': 'text-fade 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      colors: {
        // Material 3 tokens (mockup palette)
        'md-primary': '#003527',
        'md-primary-container': '#064e3b',
        'md-on-primary-container': '#80bea6',
        'md-inverse-primary': '#95d3ba',
        'md-secondary': '#006a61',
        'md-secondary-container': '#86f2e4',
        'md-on-secondary-container': '#006f66',
        'md-tertiary': '#212f41',
        'md-tertiary-container': '#374558',
        'md-error': '#ba1a1a',
        'md-error-container': '#ffdad6',
        'md-surface': '#f7f9fb',
        'md-surface-lowest': '#ffffff',
        'md-surface-low': '#f2f4f6',
        'md-surface-container': '#eceef0',
        'md-surface-high': '#e6e8ea',
        'md-surface-variant': '#e0e3e5',
        'md-on-surface': '#191c1e',
        'md-on-surface-variant': '#404944',
        'md-outline': '#707974',
        'md-outline-variant': '#bfc9c3',
        mangrove: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        ocean: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        sand: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
      },
    },
  },
  plugins: [],
}

