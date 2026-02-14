module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary-color)',
        background: 'var(--background-color)',
        'light-primary-bg': 'var(--light-primary-bg)',
        'light-gray-bg': 'var(--light-gray-bg)',
        'light-blue-bg': 'var(--light-blue-bg)',
        'light-green-bg': 'var(--light-green-bg)',
        'green-text': 'var(--green-text)',
      },
      fontFamily: {
      sans: ['var(--font-family)'],
      },
    },
  },
  plugins: [],
}
