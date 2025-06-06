/** @type {import('tailwindcss').Config} */
const { heroui } = require("@heroui/react");

module.exports = {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
		"./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			colors: {
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				chart: {
					1: "hsl(var(--chart-1))",
					2: "hsl(var(--chart-2))",
					3: "hsl(var(--chart-3))",
					4: "hsl(var(--chart-4))",
					5: "hsl(var(--chart-5))",
				},
			},
		},
	},
	darkMode: ["class", "class"],
	plugins: [
		require("tailwindcss-animate"),
		heroui({
			themes: {
				light: {
					colors: {
						default: {
							50: "#efefef",
							100: "#d8d8d8",
							200: "#c2c2c2",
							300: "#ababab",
							400: "#959595",
							500: "#7e7e7e",
							600: "#686868",
							700: "#525252",
							800: "#3c3c3c",
							900: "#262626",
							foreground: "#000",
							DEFAULT: "#7e7e7e",
						},
						primary: {
							50: "#e2edf8",
							100: "#bad3ed",
							200: "#91bae3",
							300: "#69a0d9",
							400: "#4087ce",
							500: "#186dc4",
							600: "#145aa2",
							700: "#10477f",
							800: "#0b345d",
							900: "#07213b",
							foreground: "#fff",
							DEFAULT: "#186dc4",
						},
						secondary: {
							50: "#efefef",
							100: "#d9d9d9",
							200: "#c3c3c3",
							300: "#adadad",
							400: "#979797",
							500: "#818181",
							600: "#6a6a6a",
							700: "#545454",
							800: "#3d3d3d",
							900: "#272727",
							foreground: "#000",
							DEFAULT: "#818181",
						},
						success: {
							50: "#e2f8ec",
							100: "#b9efd1",
							200: "#91e5b5",
							300: "#68dc9a",
							400: "#40d27f",
							500: "#17c964",
							600: "#13a653",
							700: "#0f8341",
							800: "#0b5f30",
							900: "#073c1e",
							foreground: "#000",
							DEFAULT: "#17c964",
						},
						warning: {
							50: "#fef4e4",
							100: "#fce4bd",
							200: "#fad497",
							300: "#f9c571",
							400: "#f7b54a",
							500: "#f5a524",
							600: "#ca881e",
							700: "#9f6b17",
							800: "#744e11",
							900: "#4a320b",
							foreground: "#000",
							DEFAULT: "#f5a524",
						},
						danger: {
							50: "#fee1eb",
							100: "#fbb8cf",
							200: "#f98eb3",
							300: "#f76598",
							400: "#f53b7c",
							500: "#f31260",
							600: "#c80f4f",
							700: "#9e0c3e",
							800: "#73092e",
							900: "#49051d",
							foreground: "#000",
							DEFAULT: "#f31260",
						},
						background: "#ffffff",
						foreground: "#000000",
						content1: {
							DEFAULT: "#ffffff",
							foreground: "#000",
						},
						content2: {
							DEFAULT: "#f4f4f5",
							foreground: "#000",
						},
						content3: {
							DEFAULT: "#e4e4e7",
							foreground: "#000",
						},
						content4: {
							DEFAULT: "#d4d4d8",
							foreground: "#000",
						},
						focus: "#006FEE",
						overlay: "#000000",
					},
				},
				dark: {
					colors: {
						default: {
							50: "#0d0d0e",
							100: "#19191c",
							200: "#26262a",
							300: "#323238",
							400: "#3f3f46",
							500: "#65656b",
							600: "#8c8c90",
							700: "#b2b2b5",
							800: "#d9d9da",
							900: "#ffffff",
							foreground: "#fff",
							DEFAULT: "#3f3f46",
						},
						primary: {
							50: "#07213b",
							100: "#0b345d",
							200: "#10477f",
							300: "#145aa2",
							400: "#186dc4",
							500: "#4087ce",
							600: "#69a0d9",
							700: "#91bae3",
							800: "#bad3ed",
							900: "#e2edf8",
							foreground: "#fff",
							DEFAULT: "#186dc4",
						},
						secondary: {
							50: "#272727",
							100: "#3d3d3d",
							200: "#545454",
							300: "#6a6a6a",
							400: "#818181",
							500: "#979797",
							600: "#adadad",
							700: "#c3c3c3",
							800: "#d9d9d9",
							900: "#efefef",
							foreground: "#000",
							DEFAULT: "#818181",
						},
						success: {
							50: "#073c1e",
							100: "#0b5f30",
							200: "#0f8341",
							300: "#13a653",
							400: "#17c964",
							500: "#40d27f",
							600: "#68dc9a",
							700: "#91e5b5",
							800: "#b9efd1",
							900: "#e2f8ec",
							foreground: "#000",
							DEFAULT: "#17c964",
						},
						warning: {
							50: "#4a320b",
							100: "#744e11",
							200: "#9f6b17",
							300: "#ca881e",
							400: "#f5a524",
							500: "#f7b54a",
							600: "#f9c571",
							700: "#fad497",
							800: "#fce4bd",
							900: "#fef4e4",
							foreground: "#000",
							DEFAULT: "#f5a524",
						},
						danger: {
							50: "#49051d",
							100: "#73092e",
							200: "#9e0c3e",
							300: "#c80f4f",
							400: "#f31260",
							500: "#f53b7c",
							600: "#f76598",
							700: "#f98eb3",
							800: "#fbb8cf",
							900: "#fee1eb",
							foreground: "#000",
							DEFAULT: "#f31260",
						},
						background: "#000000",
						foreground: "#ffffff",
						content1: {
							DEFAULT: "#18181b",
							foreground: "#fff",
						},
						content2: {
							DEFAULT: "#27272a",
							foreground: "#fff",
						},
						content3: {
							DEFAULT: "#3f3f46",
							foreground: "#fff",
						},
						content4: {
							DEFAULT: "#52525b",
							foreground: "#fff",
						},
						focus: "#006FEE",
						overlay: "#ffffff",
					},
				},
			},
			layout: {
				disabledOpacity: "0.5",
			},
		}),
	],
};
{
}
