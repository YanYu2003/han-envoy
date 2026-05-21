/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        han: {
          red: "#8B0000",
          gold: "#C9A96E",
          ink: "#2C2C2C",
          parchment: "#F5E6C8",
        },
      },
      fontFamily: {
        han: ['"Noto Serif SC"', '"Source Han Serif SC"', "serif"],
      },
    },
  },
  plugins: [],
};
