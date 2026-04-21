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
          DEFAULT: "#0a3d1f",
          dark: "#061a0e",
          mid: "#0d5229",
          light: "#1a7a3c",
        },
        gold: {
          DEFAULT: "#f5c518",
          dark: "#c9a000",
          light: "#ffd93d",
        },
      },
    },
  },
  plugins: [],
};

export default config;
