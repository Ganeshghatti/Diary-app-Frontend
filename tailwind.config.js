/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
    "./assets/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
    "./scripts/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Satoshi-Regular", "system-ui", "sans-serif"],
        medium: ["Satoshi-Medium"],
        bold: ["Satoshi-Bold"],
        black: ["Satoshi-Black"],
        light: ["Satoshi-Light"],
      },
    },
  },
  plugins: [],
};
