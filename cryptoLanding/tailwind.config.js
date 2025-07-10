/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
 
      theme: {
        extend: {
          colors: {
            teal: {
              light: '#81E6D9',
              DEFAULT: '#38B2AC',
              dark: '#234E52',
            },
          },
        },
     
    
  },
  plugins: [],
}