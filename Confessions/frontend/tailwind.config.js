/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        card: '#13131a',
        border: '#1e1e2e',
        accent: '#7c3aed',
        'accent-hover': '#6d28d9',
        'text-primary': '#f1f5f9',
        'text-muted': '#64748b',
      },
    },
  },
  plugins: [],
};
