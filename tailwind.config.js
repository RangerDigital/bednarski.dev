/** @type {import('tailwindcss').Config} */
export default {
  content: ['./components/**/*.{js,vue,ts}', './layouts/**/*.vue', './pages/**/*.vue', './plugins/**/*.{js,ts}', './app.vue', './error.vue', './content/**/*.md'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Work Sans', 'sans-serif'],
        headings: ['Poppins', 'sans-serif'],
      },

      blur: {
        xs: '3px',
      },

      // add 3xl breakpoint
      screens: {
        '3xl': '2000px',
      },

      // animate reveal from right to left with opacity

      keyframes: {
        'fade-in-right': {
          '0%': {
            opacity: '0',
            transform: 'translateX(1rem)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        'fade-out-right': {
          '0%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
          '100%': {
            opacity: '0',
            transform: 'translateX(-1rem)',
          },
        },
         
        'spin': {
          '0%': {
            transform: 'rotate(0deg)',
          },
          '100%': {
            transform: 'rotate(360deg)',
          },
        },
      },

      animation: {
        'fade-in-right': 'fade-in-right 0.25s ease-in-out',
        'fade-out-right': 'fade-out-right 0.25s ease-in-out forwards',
        'spin-slow': 'spin 3s linear infinite',
      },
    
      colors: {
        primary: {
          DEFAULT: '#FF283F',
          dark: '#9C111F',
        },

        white: '#ededed',
        dark: {
          DEFAULT: '#070707',
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
