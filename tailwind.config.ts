import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Category colors - text variants
    'text-orange-500', 'text-blue-500', 'text-green-500', 'text-red-500',
    'text-purple-500', 'text-yellow-500', 'text-pink-500', 'text-cyan-500',
    'text-indigo-500', 'text-amber-500',
    // Category colors - background variants
    'bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-red-500',
    'bg-purple-500', 'bg-yellow-500', 'bg-pink-500', 'bg-cyan-500',
    'bg-indigo-500', 'bg-amber-500',
    // Category colors - light background variants
    'bg-orange-50', 'bg-blue-50', 'bg-green-50', 'bg-red-50',
    'bg-purple-50', 'bg-yellow-50', 'bg-pink-50', 'bg-cyan-50',
    'bg-indigo-50', 'bg-amber-50',
    // Category colors - border variants (200 and 500)
    'border-orange-200', 'border-blue-200', 'border-green-200', 'border-red-200',
    'border-purple-200', 'border-yellow-200', 'border-pink-200', 'border-cyan-200',
    'border-indigo-200', 'border-amber-200',
    'border-orange-500', 'border-blue-500', 'border-green-500', 'border-red-500',
    'border-purple-500', 'border-yellow-500', 'border-pink-500', 'border-cyan-500',
    'border-indigo-500', 'border-amber-500',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "spin-around": {
          "0%": {
            transform: "translateZ(0) rotate(0)",
          },
          "15%, 35%": {
            transform: "translateZ(0) rotate(90deg)",
          },
          "65%, 85%": {
            transform: "translateZ(0) rotate(270deg)",
          },
          "100%": {
            transform: "translateZ(0) rotate(360deg)",
          },
        },
        "shimmer-slide": {
          to: {
            transform: "translate(calc(100cqw - 100%), 0)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shimmer-slide":
          "shimmer-slide var(--speed) ease-in-out infinite alternate",
        "spin-around": "spin-around calc(var(--speed) * 2) infinite linear",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
