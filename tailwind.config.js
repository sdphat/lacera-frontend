/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: {
      primary: '#0088FF',
      'primary-dark': '#0066CC',
      'primary-light': '#66B3FF',
      secondary: '#FFFFFF',
      'secondary-dark': '#E5E5E5',
      accent: '#FFC107',
      'accent-dark': '#FFA000',
      'accent-light': '#FFD54F',
      background: '#F9F9F9',
      'background-dark': '#EDEDED',
      'background-light': '#FFFFFF',
      text: '#333333',
      'text-dark': '#222222',
      'text-light': '#666666',
    },
  },
  plugins: [],
};
