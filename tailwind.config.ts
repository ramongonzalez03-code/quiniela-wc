import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        field: {
          DEFAULT: "#0b2412",
          dark: "#050e08",
          mid: "#0f3019",
          light: "#1c5c30",
        },
        gold: {
          DEFAULT: "#f5c518",
          dark: "#c9a000",
          light: "#ffe55c",
        },
        ember: "#e03535",
      },
      backgroundImage: {
        "card-gradient": "linear-gradient(145deg, #0d2815 0%, #081508 100%)",
        "gold-gradient": "linear-gradient(135deg, #f5c518 0%, #ffe55c 100%)",
        "hero-gradient": "linear-gradient(160deg, #050e08 0%, #0a2010 40%, #050e08 100%)",
      },
      boxShadow: {
        gold: "0 0 24px rgba(245,197,24,0.18)",
        "gold-sm": "0 0 10px rgba(245,197,24,0.25)",
        card: "0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
