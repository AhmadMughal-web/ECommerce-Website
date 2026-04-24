/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    'index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily:{
      Roboto:['Roboto',"sans-serif"],
      Poppins:['Poppins',"sans-serif"]
    },
    screens:{
      '1000px':'1050px',
      '1100px':'1110px',
      '800px':'800px',
      '900px':'900px',
      '1300px':'1300px',
      '400px':'400px'
    }
    },
  },
  plugins: [],
}

