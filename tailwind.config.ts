import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
    './src/hooks/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a',
        foreground: '#e2e8f0',
        primary: {
          DEFAULT: '#22d3ee',
          foreground: '#0f172a'
        }
      }
    }
  },
  plugins: []
};

export default config;
