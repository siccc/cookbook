/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'k2d': ['K2D', 'sans-serif']
      },
      aspectRatio: {
        '4/3': '4 / 3'
      },
      animation: {
        'pulse-fast': 'pulse 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    plugin(function({ addUtilities }) {
      addUtilities({
        '.no-scrollbar::-webkit-scrollbar': {
          'display': 'none'
        },
        '.no-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none'
        }
      })
    })
  ],
};
