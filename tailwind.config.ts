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
        background: "var(--background)",
        foreground: "var(--foreground)",
        casino: {
          gold: "#FFD700",
          purple: "#8B5CF6",
          darkPurple: "#581C87",
          neon: "#FF10F0",
          darkBg: "#0F0A1E",
        },
      },
      animation: {
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'glow': 'glow 1.5s ease-in-out infinite alternate',
      },
      keyframes: {
        'neon-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'glow': {
          'from': {
            textShadow: '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #FFD700, 0 0 40px #FFD700',
          },
          'to': {
            textShadow: '0 0 20px #fff, 0 0 30px #FFD700, 0 0 40px #FFD700, 0 0 50px #FFD700, 0 0 60px #FFD700',
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
