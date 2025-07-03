// eslint.config.js
const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')
const eslintPluginUnusedImports = require('eslint-plugin-unused-imports')
const eslintPluginTailwindcss = require('eslint-plugin-tailwindcss')
const reactNativePlugin = require('@react-native/eslint-plugin')

module.exports = defineConfig([
	...expoConfig,
	{
		files: ['**/*.{js,jsx,ts,tsx}'],
		plugins: {
			'unused-imports': eslintPluginUnusedImports,
			'tailwindcss': eslintPluginTailwindcss,
			'react-native': reactNativePlugin,
		},
		rules: {
			'unused-imports/no-unused-imports': 'warn',
			'unused-imports/no-unused-vars': [
				'warn',
				{
					vars: 'all',
					varsIgnorePattern: '^_',
					args: 'after-used',
					argsIgnorePattern: '^_',
				},
			],
			'tailwindcss/classnames-order': 'warn',
			'tailwindcss/no-custom-classname': 'off',
			// 'react-native/no-inline-styles': 'warn',
			// 'react-native/no-color-literals': 'off',
			// 'react-native/no-raw-text': 'off',
			// 'react-native/platform-colors': 'warn',
			// Puedes añadir aquí reglas personalizadas adicionales
		},
		ignores: [
			'node_modules',
			'android',
			'ios',
			'dist',
			'build',
			'coverage',
			'.expo',
			'.expo-shared',
			'.next',
			'out',
			'.cache',
			'bun.lockb',
			'yarn.lock',
			'package-lock.json',
			'npm-debug.log',
			'*.tsbuildinfo',
			'*.snap',
			'.DS_Store',
			'Thumbs.db',
		],
	},
])
