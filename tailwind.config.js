/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        surface: {
          DEFAULT: '#f8fafc',
          card:    '#ffffff',
          border:  '#e2e8f0',
        },
        navy: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c8d9fe',
          300: '#a5bcfc',
          400: '#7c98f8',
          500: '#5b75f2',
          600: '#3d52e6',
          700: '#2f3fd4',
          800: '#2834ab',
          900: '#1e2470',
          950: '#111440',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.05)',
        'card-md': '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)',
        'card-lg': '0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -4px rgba(0,0,0,0.05)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
  safelist: [
    { pattern: /^bg-(white|black)\/(5|10|20|25)$/ },
    { pattern: /^border-(white|black)\/(5|10|20|25)$/ },
    { pattern: /^(bg|text|border)-(indigo|emerald|violet|sky|amber|rose|slate)-(500|400|300|200)\/(10|15|20|25)$/ },
  ],
}
