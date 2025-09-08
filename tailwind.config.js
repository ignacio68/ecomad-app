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
			},
		},
	},
	plugins: [],
}
