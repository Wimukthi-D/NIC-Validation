/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      height: {
        500: "500px",
      },

      width: {
        800: "800px",
      },
      zIndex: {
        2000: "2000",
        1200: "1200",
      },
    },
  },
  plugins: [],
};
