/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-black': '#131515',
        'deep-black-1': '#181c1c',
        'deep-black-2': '#1f2525',
        'lime-green': '#2AC416',
        'crimson-red': '#6c0e23',
        'soft-white': '#f7f7ff',
      },
    },
  },
  plugins: [],
}