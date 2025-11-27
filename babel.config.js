module.exports = api => {
	api.cache(true)
	return {
		presets: [
			['babel-preset-expo', { jsxImportSource: 'nativewind' }],
			'@babel/preset-typescript',
			'nativewind/babel',
		],
		plugins: [
			['inline-import', { extensions: ['.sql'] }], // Para migraciones de Drizzle
			'react-native-worklets/plugin',
		],
		env: {
			production: {
				plugins: ['transform-remove-console'],
			},
		},
	}
}
