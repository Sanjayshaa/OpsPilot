/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0B0F19',
          800: '#111827',
          700: '#1F2937',
          600: '#374151',
        },
        devops: {
          blue: '#3B82F6',
          cyan: '#06B6D4',
          emerald: '#10B981',
          purple: '#8B5CF6',
          rose: '#F43F5E',
          amber: '#F59E0B',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon-blue': '0 0 20px rgba(59, 130, 246, 0.4)',
        'neon-cyan': '0 0 20px rgba(6, 182, 212, 0.4)',
        'neon-emerald': '0 0 20px rgba(16, 185, 129, 0.4)',
      }
    },
  },
  plugins: [],
}
