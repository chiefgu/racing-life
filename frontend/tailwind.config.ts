import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
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
        // Brand Color System - Atlantic-inspired with racing personality
        brand: {
          // Primary: Deep Navy Blue - sophisticated, authoritative (4.6:1 contrast)
          primary: {
            muted: 'hsl(215, 45%, 55%)',      // Soft navy
            DEFAULT: 'hsl(215, 60%, 35%)',    // Rich navy
            intense: 'hsl(215, 70%, 25%)',    // Deep navy
          },
          // Secondary: Burgundy/Wine - premium, heritage (4.5:1 contrast)
          secondary: {
            muted: 'hsl(350, 45%, 55%)',      // Soft burgundy
            DEFAULT: 'hsl(350, 65%, 40%)',    // Rich burgundy
            intense: 'hsl(350, 75%, 30%)',    // Deep burgundy
          },
          // Accent: Champagne Gold - celebration, winners
          accent: {
            muted: 'hsl(45, 60%, 65%)',       // Soft gold
            DEFAULT: 'hsl(45, 75%, 55%)',     // Champagne gold
            intense: 'hsl(45, 85%, 45%)',     // Rich gold
          },
          // Light: Minimal background tints
          light: {
            muted: 'hsl(210, 20%, 99%)',      // Cool off-white
            DEFAULT: 'hsl(210, 20%, 97%)',    // Cool subtle gray
            intense: 'hsl(210, 20%, 94%)',    // Cool light gray
          },
          // Dark: True blacks and near-blacks for editorial feel
          dark: {
            muted: 'hsl(215, 10%, 25%)',      // Navy-tinted gray
            DEFAULT: 'hsl(215, 15%, 10%)',    // Navy-tinted near black
            intense: 'hsl(215, 20%, 5%)',     // Navy-tinted black
          },
          // UI: Subtle neutral borders
          ui: {
            muted: 'hsl(210, 15%, 92%)',      // Very light cool gray
            DEFAULT: 'hsl(210, 15%, 85%)',    // Light cool border
            intense: 'hsl(210, 15%, 70%)',    // Medium cool border
          },
        },
        // Legacy racing colors (kept for backwards compatibility)
        racing: {
          green: '#10b981',
          blue: '#3b82f6',
          gold: '#fbbf24',
          dark: '#0f172a',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        serif: ["Merriweather", "serif"],
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
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s infinite",
        fadeIn: "fadeIn 0.5s ease-out",
        slideIn: "slideIn 0.3s ease-out",
        "pulse-subtle": "pulse-subtle 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;