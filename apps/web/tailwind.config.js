/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out forwards',
        'fade-out': 'fadeOut 0.3s ease-in-out forwards',
        'zoom-in': 'zoomIn 0.3s ease-in-out forwards',
        'zoom-out': 'zoomOut 0.3s ease-in-out forwards',
        'slide-in': 'slideIn 0.3s ease-in-out forwards',
        'slide-out': 'slideOut 0.3s ease-in-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        zoomIn: {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        zoomOut: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0.95)' },
        },
        slideIn: {
          '0%': { transform: 'translate(-50%, -48%)' },
          '100%': { transform: 'translate(-50%, -50%)' },
        },
        slideOut: {
          '0%': { transform: 'translate(-50%, -50%)' },
          '100%': { transform: 'translate(-50%, -48%)' },
        },
      },
    },
  },
  plugins: [],
};