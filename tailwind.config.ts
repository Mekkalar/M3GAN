import type { Config } from "tailwindcss";

const config: Config = {
    content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
    theme: {
        extend: {
            colors: {
                background: "var(--color-background)",
                foreground: "var(--color-foreground)",
                primary: {
                    DEFAULT: "var(--color-primary)",
                    foreground: "var(--color-primary-foreground)",
                },
                secondary: {
                    DEFAULT: "var(--color-secondary)",
                    foreground: "var(--color-secondary-foreground)",
                },
                accent: {
                    DEFAULT: "var(--color-accent)",
                    foreground: "var(--color-accent-foreground)",
                },
                card: {
                    DEFAULT: "var(--color-card)",
                    foreground: "var(--color-card-foreground)",
                },
                border: "var(--color-border)",
                muted: {
                    DEFAULT: "var(--color-text-muted)",
                    foreground: "var(--color-text-body)",
                },
                heading: "var(--color-text-heading)",
                body: "var(--color-text-body)",
            },
            fontFamily: {
                sans: ["var(--font-sans)", "sans-serif"],
            },
        },
    },
    plugins: [],
};

export default config;
