import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-cairo)", "var(--font-tajawal)", "system-ui", "sans-serif"],
      },
      colors: {
        gold: "#c9a878",
        ink: "#0a0a0a",
      },
    },
  },
  plugins: [],
};

export default config;
