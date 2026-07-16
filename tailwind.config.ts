import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Editorial, near-monochrome. Clothing imagery provides the color.
        paper: "#F7F6F3", // near-white editorial paper
        card: "#FFFFFF",
        ink: "#1B1A18", // near-black — primary text + primary actions
        muted: "#8C877D", // secondary text
        line: "#E7E4DD", // hairline borders
        soft: "#EFEDE7", // subtle fills / tag backgrounds
        clay: "#B89B8E", // single restrained warm accent, used sparingly
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(27,26,24,0.04), 0 8px 24px rgba(27,26,24,0.05)",
        lift: "0 12px 40px rgba(27,26,24,0.12)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.4s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
