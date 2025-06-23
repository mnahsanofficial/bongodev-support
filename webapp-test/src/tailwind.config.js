/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
      ]
,      
    theme: {
      extend: {
        colors: {
          primary: {
            500: '#6366f1',
            600: '#4f46e5',
          },
        },
      },
    },
    plugins: [],
  }