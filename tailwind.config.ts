import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#ededed',
        surface: '#1a1a1a',
        'surface-2': '#242424',
        border: '#2a2a2a',
        primary: '#25D366',
        'primary-dark': '#1da851',
        accent: '#128C7E',
      },
    },
  },
  plugins: [],
}

export default config
