/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f1ff',
          100: '#c2d9ff',
          200: '#96bbff',
          300: '#6e9dff',
          400: '#5088ff',
          500: '#58a6ff', // GitHub primary blue
          600: '#388bfd',
          700: '#1f6feb',
          800: '#1158c7',
          900: '#0d419d',
        },
        github: {
          dark: '#0d1117',       // Main background
          darker: '#010409',     // Dropdown backgrounds 
          medium: '#161b22',     // Secondary background
          light: '#21262d',      // Buttons, block quotes
          border: '#30363d',     // Borders, dividers
          text: {
            primary: '#c9d1d9',  // Main text
            secondary: '#8b949e', // Secondary text
            link: '#58a6ff',     // Links
          },
          success: '#238636',    // Buttons
          danger: '#f85149',     // Errors
          warning: '#d29922',    // Warnings
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji'],
        mono: ['SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
  darkMode: 'class' // Enable dark mode variant
}
