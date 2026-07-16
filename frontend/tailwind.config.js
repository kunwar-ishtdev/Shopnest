/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef3f2',
          100: '#fee5e2',
          200: '#fccfc9',
          300: '#f9aca4',
          400: '#f47b70',
          500: '#e94f3f',
          600: '#d63525',
          700: '#b3281b',
          800: '#94241a',
          900: '#7a231c',
          950: '#420d09',
        },
        dark: {
          50: '#f6f6f7',
          100: '#e1e3e7',
          200: '#c3c7cf',
          300: '#9da3af',
          400: '#777f8e',
          500: '#5c6474',
          600: '#494f5d',
          700: '#3c404c',
          800: '#333741',
          900: '#1e2028',
          950: '#13141a',
        },
      },
      fontFamily: {
        display: ['"Clash Display"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
      },
      boxShadow: {
        brand: '0 4px 24px -4px rgba(233, 79, 63, 0.35)',
        card: '0 2px 16px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.14)',
      },
    },
  },
  plugins: [],
};