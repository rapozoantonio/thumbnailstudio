// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#007AFF",   // Apple-inspired blue
        secondary: "#30D158", // Fresh green
        accent: "#FF2D55",    // Bold accent red
        background: "#1C1C1E",// Modern dark background
        surface: "#2C2C2E",   // Sleek surface for cards/panels
        muted: "#8E8E93",     // Muted text color
      },
      fontFamily: {
        code: ["Fira Code", "monospace"],
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        md: "0 4px 6px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
  corePlugins: {
    preflight: false, // Prevents Tailwind from resetting MUI styles
  },
}
