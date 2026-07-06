import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Northstar Labs dark palette
        base: {
          900: "#07080d",
          850: "#0b0d14",
          800: "#0f111a",
          750: "#141725",
          700: "#1b1f30",
          600: "#272c42",
        },
        accent: {
          DEFAULT: "#6d8bff",
          soft: "#8aa0ff",
          glow: "#5168ff",
        },
        signal: {
          orchestrator: "#6d8bff",
          strategist: "#c084fc",
          research: "#34d399",
          behavioral: "#fbbf24",
          trader: "#22d3ee",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(109,139,255,0.18), 0 8px 40px -12px rgba(81,104,255,0.45)",
      },
      keyframes: {
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        pulseSoft: "pulseSoft 1.6s ease-in-out infinite",
        fadeUp: "fadeUp 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
