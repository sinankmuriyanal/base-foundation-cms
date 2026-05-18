import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1a6b3c",
          light: "#2d8f54",
          dark: "#124d2b",
          50: "#f0faf4",
          100: "#dcf5e6",
        },
        accent: "#f5a623",
        cream: "#fdf8f0",
        ink: "#1a1a0f",
        "green": "#1a6b3c",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
