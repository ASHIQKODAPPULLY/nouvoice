import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
        // Trending design colors
        gradient: {
          blue: "hsl(var(--gradient-blue))",
          purple: "hsl(var(--gradient-purple))",
          teal: "hsl(var(--gradient-teal))",
          pink: "hsl(var(--gradient-pink))",
          orange: "hsl(var(--gradient-orange))",
          green: "hsl(var(--gradient-green))",
        },
        trending: {
          bold: "hsl(var(--bold-accent))",
          soft: "hsl(var(--soft-accent))",
          dark: "hsl(var(--dark-accent))",
          vibrant: "hsl(var(--vibrant-accent))",
        },
        // Industry-specific colors
        tech: {
          primary: "hsl(var(--tech-primary))",
          secondary: "hsl(var(--tech-secondary))",
          accent: "hsl(var(--tech-accent))",
        },
        creative: {
          primary: "hsl(var(--creative-primary))",
          secondary: "hsl(var(--creative-secondary))",
          accent: "hsl(var(--creative-accent))",
        },
        medical: {
          primary: "hsl(var(--medical-primary))",
          secondary: "hsl(var(--medical-secondary))",
          accent: "hsl(var(--medical-accent))",
        },
        finance: {
          primary: "hsl(var(--finance-primary))",
          secondary: "hsl(var(--finance-secondary))",
          accent: "hsl(var(--finance-accent))",
        },
        legal: {
          primary: "hsl(var(--legal-primary))",
          secondary: "hsl(var(--legal-secondary))",
          accent: "hsl(var(--legal-accent))",
        },
        education: {
          primary: "hsl(var(--education-primary))",
          secondary: "hsl(var(--education-secondary))",
          accent: "hsl(var(--education-accent))",
        },
        retail: {
          primary: "hsl(var(--retail-primary))",
          secondary: "hsl(var(--retail-secondary))",
          accent: "hsl(var(--retail-accent))",
        },
        food: {
          primary: "hsl(var(--food-primary))",
          secondary: "hsl(var(--food-secondary))",
          accent: "hsl(var(--food-accent))",
        },
        construction: {
          primary: "hsl(var(--construction-primary))",
          secondary: "hsl(var(--construction-secondary))",
          accent: "hsl(var(--construction-accent))",
        },
        realestate: {
          primary: "hsl(var(--real-estate-primary))",
          secondary: "hsl(var(--real-estate-secondary))",
          accent: "hsl(var(--real-estate-accent))",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
