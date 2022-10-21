/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'k2d': ['K2D', 'sans-serif']
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
};
