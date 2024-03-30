/** @type {import('tailwindcss').Config} */
export default {
  content: ['./components/**/*.{js,vue,ts}', './layouts/**/*.vue', './pages/**/*.vue', './plugins/**/*.{js,ts}', './app.vue', './error.vue'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Work Sans', 'sans-serif'],
        headings: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: '#ff344a',

        white: '#f6f6f6',
        dark: {
          DEFAULT: '#0c0c0c',
          light: '#141315',
          lighter: '#2c2b2d',
        },
      },
      boxShadow: {
        'inner-white': 'inset 0 0 0 1px rgba(255, 255, 255, 0.02)',
      },
      backgroundImage: {
        stripes: 'linear-gradient(45deg, #141315 25%, #0c0c0c 25%, #0c0c0c 50%, #141315 50%, #141315 75%, #0c0c0c 75%, #0c0c0c 100%);',
      },
      backgroundSize: {
        stripe: '56.57px 56.57px',
      },
    },
  },
  plugins: [],
};
