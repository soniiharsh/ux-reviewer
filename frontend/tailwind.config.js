/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          500: '#4f6ef7',
          600: '#3b56e8',
          700: '#2d42c9',
        },
      },
    },
  },
  plugins: [],
};
