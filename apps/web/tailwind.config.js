/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ESUM Brand Colors
        esum: {
          green: {
            DEFAULT: '#00A86B',
            dark: '#007A54',
            light: '#00C980'
          },
          navy: {
            DEFAULT: '#0A111E',
            light: '#1E293B'
          },
          gold: {
            DEFAULT: '#C9A12B',
            light: '#E5C058'
          },
          blue: {
            DEFAULT: '#1A73E8',
            light: '#4D98F0'
          },
          solar: '#FF6B35',
          wind: '#00B4D8'
        },
        // Status colors
        success: '#00A86B',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#1A73E8'
      },
      fontFamily: {
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'esum-gradient': 'linear-gradient(135deg, #00A86B 0%, #007A54 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}
