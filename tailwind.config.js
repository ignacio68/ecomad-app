/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/**/*.{js,jsx,ts,tsx}',
		'./src/(app|components)/**/*.{js,jsx,ts,tsx}',
	],
	presets: [require('nativewind/preset')],
	theme: {
		extend: {
			fontFamily: {
				'lato-regular': ['Lato-Regular', 'sans-serif'],
				'lato-light': ['Lato-Light', 'sans-serif'],
				'lato-medium': ['Lato-Medium', 'sans-serif'],
				'lato-semibold': ['Lato-SemiBold', 'sans-serif'],
				'lato-bold': ['Lato-Bold', 'sans-serif'],
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

