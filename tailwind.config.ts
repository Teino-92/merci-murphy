import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F5F0E8',
        rose: '#FFDAD4',
        terracotta: '#C4845A',
        'terracotta-dark': '#8B5A3A',
        charcoal: '#1A1A1A',
        'charcoal-light': '#424242',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
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
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        snip: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-20deg)' },
          '75%': { transform: 'rotate(20deg)' },
        },
        ripple: {
          '0%, 100%': { transform: 'translateY(0px) scaleX(1)' },
          '33%': { transform: 'translateY(-3px) scaleX(0.95)' },
          '66%': { transform: 'translateY(2px) scaleX(1.05)' },
        },
        drip: {
          '0%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(4px)' },
          '60%': { transform: 'translateY(-2px)' },
        },
        pulse_heart: {
          '0%, 100%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.25)' },
          '60%': { transform: 'scale(0.95)' },
        },
        paw_bounce: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '40%': { transform: 'translateY(-5px) rotate(-8deg)' },
          '70%': { transform: 'translateY(2px) rotate(4deg)' },
        },
        dice_spin: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '40%': { transform: 'rotate(180deg) scale(1.2)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        avatar_wiggle: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '20%': { transform: 'translateY(-6px) scale(1.1)' },
          '40%': { transform: 'translateY(-4px) rotate(8deg) scale(1.1)' },
          '60%': { transform: 'translateY(-4px) rotate(-8deg) scale(1.1)' },
          '80%': { transform: 'translateY(0) rotate(0deg) scale(1.05)' },
        },
      },
      animation: {
        snip: 'snip 0.5s ease-in-out',
        ripple: 'ripple 0.7s ease-in-out',
        drip: 'drip 0.5s ease-in-out',
        pulse_heart: 'pulse_heart 0.5s ease-in-out',
        paw_bounce: 'paw_bounce 0.5s ease-in-out',
        dice_spin: 'dice_spin 0.5s ease-in-out',
        avatar_wiggle: 'avatar_wiggle 0.6s ease-in-out',
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require('tailwindcss-animate')],
}
export default config
