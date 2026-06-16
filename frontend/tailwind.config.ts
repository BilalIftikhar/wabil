import type { Config } from "tailwindcss";

// WABIL design tokens — Ivory / Charcoal / Rose Gold / Blush
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#FAFAFA",
        charcoal: "#1A1A2E",
        rosegold: "#C9A96E",
        blush: "#F4C2C2",
        // semantic aliases driven by CSS vars (light/dark)
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        muted: "var(--muted)",
        border: "var(--border)",
        accent: "var(--accent)",
      },
      fontFamily: {
        heading: ["var(--font-cormorant)", "Cormorant Garamond", "serif"],
        body: ["var(--font-dm-sans)", "DM Sans", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        luxe: "0 10px 40px -12px rgba(26,26,46,0.18)",
        glow: "0 0 0 1px rgba(201,169,110,0.4), 0 8px 30px -8px rgba(201,169,110,0.35)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shake: {
          "0%,100%": { transform: "translateX(0)" },
          "20%,60%": { transform: "translateX(-6px)" },
          "40%,80%": { transform: "translateX(6px)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
        "fade-up": "fade-up 0.6s ease-out both",
        shake: "shake 0.4s ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
