/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "gray-100": "#e5e6e8",
        "black-100": "#3a3a3a",
      },
    },
  },
  plugins: [],
};
