/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        underground: "#2C1B18",
        "worm-neon": "#FF4B91",
        meadow: "#74B72E",
        sunflower: "#FFC436",
        clay: "#A0522D",
        "grass-light": "#88D63E",
        "grass-dark": "#5A8C23",
      },
      fontFamily: {
        display: ["'Luckiest Guy'", "cursive"],
        body: ["Lexend", "sans-serif"],
      },
      animation: {
        squirm: "squirm 4s infinite ease-in-out",
        wiggle: "wiggle 0.5s infinite ease-in-out",
      },
      keyframes: {
        squirm: {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "50%": { borderRadius: "30% 60% 70% 30% / 50% 60% 30% 60%" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
      },
    },
  },
  plugins: [],
}
