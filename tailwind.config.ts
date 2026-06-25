import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Rui's stage palette — warm spotlight + deep theatre curtain.
        stage: {
          bg: "#0e0a14",
          panel: "#171022",
          accent: "#e85d9b",
          accent2: "#7b5cff",
          spot: "#ffd58a",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "spot-pulse": {
          "0%, 100%": { opacity: "0.85" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "spot-pulse": "spot-pulse 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
