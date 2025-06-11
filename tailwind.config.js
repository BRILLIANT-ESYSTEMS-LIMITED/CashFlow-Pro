/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#D8E0FF',
          200: '#B2C1FF',
          300: '#8BA2FF',
          400: '#6583FF',
          500: '#3E64FF',
          600: '#1E3A8A',
          700: '#172C66',
          800: '#101E44',
          900: '#080F22',
        },
        secondary: {
          50: '#EFFAF9',
          100: '#D5F5F2',
          200: '#ABEAE5',
          300: '#82DFD8',
          400: '#58D4CB',
          500: '#2FC9BE',
          600: '#0D9488',
          700: '#0A6F67',
          800: '#074A45',
          900: '#032522',
        },
        accent: {
          50: '#FFFAEB',
          100: '#FEF0C7',
          200: '#FDE18F',
          300: '#FCD34D',
          400: '#FBC528',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#783C0F',
        },
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',
          700: '#047857',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          700: '#B45309',
        },
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          700: '#B91C1C',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};