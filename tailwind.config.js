/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.js",
    "./resources/**/*.jsx",
  ],
  theme: {
    extend: {
      colors: {
        'ink': 'var(--ink)',
        'surface': 'var(--surface)',
        'muted': 'var(--muted)',
        'border-light': 'var(--border-light)',
      },
      fontFamily: {
        'heading': ['Poppins', 'sans-serif'],
        'sans': ['Inter', 'sans-serif'],
        'serif': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
