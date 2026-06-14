import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Base surfaces (deep navy-black)
        base: {
          950: "#05060c",
          900: "#07080f",
          850: "#0a0c16",
          800: "#0e1020",
          750: "#13162a",
          700: "#191d34",
          600: "#22283f",
          500: "#2e3554",
          400: "#3d4468",
        },
        // ── Accent (indigo/periwinkle)
        accent: {
          DEFAULT: "#6d8bff",
          soft: "#8aa0ff",
          glow: "#5168ff",
          dim: "rgba(109,139,255,0.12)",
          border: "rgba(109,139,255,0.24)",
        },
        // ── Signal colors per agent role
        signal: {
          orchestrator: "#6d8bff",
          strategist: "#a78bfa",
          research: "#34d399",
          behavioral: "#fbbf24",
          trader: "#22d3ee",
        },
        // ── Semantic status
        status: {
          success: "#34d399",
          warning: "#fbbf24",
          danger: "#f87171",
          info: "#60a5fa",
          neutral: "#8892b0",
        },
        // ── Warm accent (capital / flow)
        warm: {
          DEFAULT: "#e2b17c",
          dim: "rgba(226,177,124,0.15)",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Display
        "display-xl": ["4.5rem", { lineHeight: "1.02", letterSpacing: "-0.04em" }],
        "display-lg": ["3.5rem", { lineHeight: "1.04", letterSpacing: "-0.035em" }],
        "display-md": ["2.75rem", { lineHeight: "1.06", letterSpacing: "-0.03em" }],
        // Heading
        "heading-xl": ["2rem", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
        "heading-lg": ["1.5rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "heading-md": ["1.125rem", { lineHeight: "1.3", letterSpacing: "-0.015em" }],
        // Body
        "body-lg": ["1rem", { lineHeight: "1.6" }],
        "body-md": ["0.875rem", { lineHeight: "1.6" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.55" }],
        // Caption / Label
        "caption-lg": ["0.75rem", { lineHeight: "1.4" }],
        "caption-sm": ["0.6875rem", { lineHeight: "1.4" }],
        // Mono labels
        "mono-label": ["0.625rem", { lineHeight: "1.3", letterSpacing: "0.18em" }],
        "mono-sm": ["0.6875rem", { lineHeight: "1.4", letterSpacing: "0.1em" }],
        "mono-md": ["0.75rem", { lineHeight: "1.5", letterSpacing: "0.06em" }],
      },
      spacing: {
        "4.5": "1.125rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
      },
      borderRadius: {
        "xs": "4px",
        "sm": "6px",
        DEFAULT: "8px",
        "md": "10px",
        "lg": "12px",
        "xl": "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      boxShadow: {
        // Glow effects
        "glow-accent": "0 0 0 1px rgba(109,139,255,0.2), 0 8px 40px -12px rgba(81,104,255,0.5)",
        "glow-sm": "0 0 0 1px rgba(109,139,255,0.15)",
        "glow-success": "0 0 0 1px rgba(52,211,153,0.2), 0 4px 20px -8px rgba(52,211,153,0.3)",
        // Surfaces
        "surface-sm": "0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)",
        "surface-md": "0 4px 16px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.2)",
        "surface-lg": "0 16px 48px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.25)",
        "surface-xl": "0 40px 120px -20px rgba(0,0,0,0.6)",
      },
      keyframes: {
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        flowDash: {
          to: { strokeDashoffset: "-40" },
        },
      },
      animation: {
        pulseSoft: "pulseSoft 2s ease-in-out infinite",
        fadeUp: "fadeUp 0.3s cubic-bezier(0.16,1,0.3,1)",
        fadeIn: "fadeIn 0.25s ease-out",
        slideIn: "slideIn 0.3s cubic-bezier(0.16,1,0.3,1)",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
