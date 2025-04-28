// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{html,js,ts,jsx,tsx}', // Adjust this to match your project structure
  ],
  theme: {
    extend: {
      animation: {
        'move-right-left': 'moveRightLeft 3s linear infinite',
        'slide-up': 'slideUp 1s ease-out forwards', 

      },
      keyframes: {
        moveRightLeft: {
          '0%': { transform: 'translateX(100%)' }, // Start from the right
          '100%': { transform: 'translateX(0%)' }, // End at its final position
        },
        slideUp: {
          '0%': { transform: 'translateY(-20px)', opacity: 0 }, // Start above and hidden
          '100%': { transform: 'translateY(0)', opacity: 1 }, // End in place and visible
        },
      },
    },
  },
  plugins: [],
};
