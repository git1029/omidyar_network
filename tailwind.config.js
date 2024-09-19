/** @type {import('tailwindcss').Config} */

const defaultTheme = require("tailwindcss/defaultTheme");

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: "FeijoaDisplay",
        serif: ["FeijoaMedium", ...defaultTheme.fontFamily.serif],
        sans: ["F37LinecaMedium", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        "gray-100": "#e5e6e8",
        "black-100": "#3a3a3a",
        // "background": "#90a7d6",
        background: "rgb(var(--background-color))",
        foreground: "rgb(var(--foreground-color))",
      },
      transition: {
        background: "background-color .5s ease-in-out",
      },
      animation: {
        fade: "fadeIn .5s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
