/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "light-tint": "#f3f4f6",
        "dark-tint": "#14532d",
        customgreen: "#54816D",
      },

      accent: {
          DEFAULT: "#F9B16E",
          dark: "#D7904F",
        },
        primary: {
          DEFAULT: "#244835",
          dark: "#1A352A",
        },
      slate: {
        300: "#cbd5e1",
        400: "#94a3b8",
        500: "#64748b",
        700: "#334155",
        800: "#1e293b",
      },
    },
  },
  plugins: [],
  darkMode: "media",
};
