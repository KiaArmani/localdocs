import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["selector", "class"],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/srcs/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		textColor: {
  			color: {
  				high: 'hsl(var(--p-color-text-high))',
  				base: 'hsl(var(--p-color-text))',
  				low: 'hsl(var(--p-color-text-low))',
  				lower: 'hsl(var(--p-color-text-lower))',
  				lowest: 'hsl(var(--p-color-text-lowest))'
  			}
  		},
  		stroke: {
  			color: {
  				high: 'hsl(var(--p-color-text-high))',
  				base: 'hsl(var(--p-color-text))',
  				low: 'hsl(var(--p-color-text-low))',
  				lower: 'hsl(var(--p-color-text-lower))',
  				lowest: 'hsl(var(--p-color-text-lowest))'
  			}
  		},
  		backgroundColor: {
  			color: {
  				high: 'hsl(var(--p-color-bg-high))',
  				base: 'hsl(var(--p-color-bg))',
  				low: 'hsl(var(--p-color-bg-low))',
  				lower: 'hsl(var(--p-color-bg-lower))',
  				lowest: 'hsl(var(--p-color-bg-lowest))'
  			}
  		},
  		borderColor: {
  			color: {
  				base: 'hsl(var(--p-color-border))'
  			}
  		},
  		colors: {
  			color: {
  				accent: {
  					high: 'hsl(var(--p-color-accent-high))',
  					base: 'hsl(var(--p-color-accent))',
  					low: 'hsl(var(--p-color-accent-low))'
  				}
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			mono: [
  				'var(--font-geist-mono)',
                    ...fontFamily.mono
                ],
  			sans: [
  				'var(--font-geist-sans)',
                    ...fontFamily.sans
                ]
  		},
  		fontSize: {
  			sm: [
  				'var(--p-font-size-sm)',
  				{
  					lineHeight: 'var(--p-font-height-sm)',
  					letterSpacing: 'var(--p-letter-spacing-sm)'
  				}
  			]
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
export default config;
