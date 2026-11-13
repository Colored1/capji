import type { Config } from "tailwindcss";

const v = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-cairo)", "var(--font-tajawal)", "system-ui", "sans-serif"],
      },
      colors: {
        bg: v("--bg"),
        fg: v("--fg"),
        gold: v("--gold"),
        cyan: v("--cyan"),
        violet: v("--violet"),
        ink: "#0a0a0a",
      },
      boxShadow: {
        glow: "0 0 45px -12px rgb(34 211 238 / 0.45)",
        glowViolet: "0 0 60px -14px rgb(139 92 246 / 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
