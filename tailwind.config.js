/** @type {import('tailwindcss').Config} */

module.exports = {
	content: ['./src/**/*.{js,jsx,ts,tsx}'],
	presets: [require('nativewind/preset')],
	theme: {
		extend: {
			fontFamily: {
				'lato-regular': ['Lato-Regular'],
				'lato-light': ['Lato-Light'],
				'lato-medium': ['Lato-Medium'],
				'lato-semibold': ['Lato-Semibold'],
				'lato-bold': ['Lato-Bold'],
				'lato-italic': ['Lato-Italic'],
			},
			colors: {
				primary: '#3d9970',
				secondary: '#0074d9',
				tertiary: '#111111',
				quaternary: '#f4f4f4',
				clothing_bins: {
					50: '#ffecee',
					100: '#ffcfd2',
					200: '#ff9ea7',
					300: '#ff6b7c',
					400: '#ff0f4b',
					500: '#d3003b',
					600: '#a8002d',
					700: '#800020',
					800: '#640017',
					900: '#41000b',
					950: '#2c0006',
				},
			},
		},
	},
	plugins: [],
}
