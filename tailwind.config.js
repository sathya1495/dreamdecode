/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        dream: {
          bg: "#0A0E27",
          surface: "#151A3A",
          card: "#1C2145",
          purple: "#7C5CFC",
          gold: "#FFB647",
          green: "#4ADE80",
          red: "#F87171",
          blue: "#3B82F6",
          teal: "#2DD4BF",
          amber: "#F59E0B",
          gray: "#6B7280",
          "light-purple": "#A78BFA",
        },
        text: {
          primary: "#F1F5F9",
          secondary: "#94A3B8",
          muted: "#64748B",
        },
      },
    },
  },
  plugins: [],
};

