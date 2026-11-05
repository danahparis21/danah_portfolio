import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mac: {
          bg: "#0d1117",
          window: "rgba(255, 255, 255, 0.75)",
          windowDark: "rgba(30, 30, 35, 0.75)",
          border: "rgba(255, 255, 255, 0.2)",
          borderDark: "rgba(255, 255, 255, 0.1)",
          pink: {
            50: "#fff1f2",
            100: "#ffe4e6",
            200: "#fecdd3",
            300: "#fda4af",
            400: "#fb7185",
            500: "#f43f5e",
          },
          garden: {
            grass: "#62a84e",
            darkGrass: "#457934",
            earth: "#2e5323"
          }
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "mac-window": "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.15)",
        "mac-card": "0 10px 30px -10px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2)",
        "holo": "0 0 25px rgba(255, 182, 193, 0.5), 0 0 50px rgba(173, 216, 230, 0.3)",
      },
      animation: {
        "float": "float 4s ease-in-out infinite",
        "shimmer": "shimmer 2.5s infinite linear",
        "swing": "swing 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        swing: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

