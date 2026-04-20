import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        brand: 'var(--brand)',
        page: 'var(--bg-page)',
        surface: 'var(--bg-card)',
      },
      fontSize: {
        'xs':         ['0.75rem',   { lineHeight: '1rem' }],
        'body-sm':    ['0.875rem',  { lineHeight: '1.25rem' }],
        'body':       ['1rem',      { lineHeight: '1.5rem' }],
        'body-lg':    ['1.125rem',  { lineHeight: '1.625rem' }],
        'heading-sm': ['1.25rem',   { lineHeight: '1.75rem',  fontWeight: '600' }],
        'heading':    ['1.5rem',    { lineHeight: '2rem',     fontWeight: '600' }],
        'title':      ['1.75rem',   { lineHeight: '2.25rem',  fontWeight: '700' }],
        'display':    ['2.25rem',   { lineHeight: '2.75rem',  fontWeight: '700' }],
      },
      fontFamily: {
        playfair: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #FF6500, #FF9A3C)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [typography],
};

export default config;
