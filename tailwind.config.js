/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './screens/**/*.{js,ts,jsx,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#F7F9FC',
          card: '#FFFFFF',
          border: '#E6EAF0',
        },
        primary: {
          main: '#7FB3D5',
          light: '#A8D0E6',
          dark: '#5D9BC4',
          contrast: '#FFFFFF',
        },
        secondary: {
          purple: '#CDB4DB',
          peach: '#FFD6A5',
          mint: '#A8E6CF',
        },
        text: {
          primary: '#2D3436',
          secondary: '#636E72',
          disabled: '#B2BEC3',
        },
        success: {
          bg: '#E8F8F2',
          text: '#2E7D6B',
          border: '#2E7D6B1A',
        },
        error: {
          bg: '#FDECEA',
          text: '#C0392B',
          border: '#C0392B1A',
        },
        warning: {
          bg: '#FFF6E5',
          text: '#B9770E',
          border: '#B9770E1A',
        },
        info: {
          bg: '#EAF4FD',
          text: '#2C6E91',
          border: '#2C6E911A',
        },
      },
    },
  },
  plugins: [],
};
