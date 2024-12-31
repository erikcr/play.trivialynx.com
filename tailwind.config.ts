import type { Config } from "tailwindcss";
import gluestackPlugin from "@gluestack-ui/nativewind-utils/tailwind-plugin";

const config: Config = {
  presets: [require("nativewind/preset")],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary: "#b45309",
        "primary-dark": "#78350f",
        "primary-hover": "#78350f",
        "primary-dark-hover": "#b45309",
        "foreground": "#ffffff",
        "muted": "#d1d5db",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), gluestackPlugin],
  darkMode: "class",
};
export default config;
