import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Rui's canonical-inspired palette (see CLAUDE.md §11):
        // lavender-purple primary, gold spotlight, cyan accents.
        stage: {
          bg: "#0e0a14",
          panel: "#171022",
          accent: "#BB88EE", // lavender-purple (primary)
          accent2: "#2BC7D9", // cyan
          spot: "#F7D84A", // gold
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
