/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        // ─── New primary palette ──────────────────────────────────
        brand: {
          50:  '#fef9f0',
          100: '#fdf0d8',
          200: '#fbe3b0',
          300: '#f8cf7a',
          400: '#f5a623',  // primary amber/orange
          500: '#e8940f',
          600: '#cc7a0a',
          700: '#a85f0c',
          800: '#8a4c10',
          900: '#3d1515',  // dark maroon
          950: '#2a0e0e',  // deepest
        },
        maroon: {
          DEFAULT: '#3d1515',
          50:  '#fdf3f3',
          100: '#fce4e4',
          200: '#f9cdcd',
          300: '#f4a8a8',
          400: '#ec7575',
          500: '#df4848',
          600: '#c42f2f',
          700: '#a32222',
          800: '#6b1717',
          900: '#3d1515',
          950: '#2a0e0e',
        },
        cream: {
          DEFAULT: '#faf8f5',
          50:  '#fdfcfb',
          100: '#faf8f5',
          200: '#f5f0e8',
          300: '#ede8d0',
          400: '#e2d9b8',
          500: '#d4c89e',
        },
        amber: {
          DEFAULT: '#f5a623',
          50:  '#fef9f0',
          100: '#fdf0d8',
          200: '#fbe3b0',
          300: '#f8cf7a',
          400: '#f5a623',
          500: '#e8940f',
          600: '#cc7a0a',
        },
        surface: {
          DEFAULT: '#faf8f5',
          card:    '#ffffff',
          border:  '#ede8d0',
        },
      },
      boxShadow: {
        card:      '0 1px 3px rgba(61,21,21,0.04), 0 1px 2px rgba(61,21,21,0.02)',
        'card-md': '0 4px 12px rgba(61,21,21,0.06), 0 2px 4px rgba(61,21,21,0.03)',
        'card-lg': '0 12px 24px rgba(61,21,21,0.08), 0 4px 8px rgba(61,21,21,0.04)',
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
  ],
}
