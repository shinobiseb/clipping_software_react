// tailwind.config.js
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          darkblue: 'var(--color-darkblue)',
          lightblue: 'var(--color-lightblue)',
          orange: 'var(--color-orange)',
          yellow: 'var(--color-yellow)',
          red: 'var(--color-red)',
          lightred: 'var(--color-lightred)',
          gray: 'var(--color-gray)'
        },
      },
    },
    plugins: [],
  }
  