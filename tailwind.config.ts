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
      boxShadow: {
        field: '0 1px 2px rgba(0,0,0,0.04), 0 6px 16px -4px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'overlay-in':  { from: { opacity: '0' }, to: { opacity: '1' } },
        'overlay-out': { from: { opacity: '1' }, to: { opacity: '0' } },
        'dialog-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'dialog-out': {
          from: { opacity: '1', transform: 'scale(1)' },
          to:   { opacity: '0', transform: 'scale(0.96)' },
        },
      },
      animation: {
        'overlay-in':  'overlay-in 150ms ease-out',
        'overlay-out': 'overlay-out 120ms ease-in',
        'dialog-in':   'dialog-in 150ms ease-out',
        'dialog-out':  'dialog-out 120ms ease-in',
      },
    },
  },
  plugins: [typography],
};

export default config;
