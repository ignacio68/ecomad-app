import { ConfigContext, ExpoConfig } from '@expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
	...config,
	name: 'ecomad-app',
	slug: 'ecomad-app',
	version: process.env.APP_VERSION ?? '1.0.3',
	orientation: 'portrait',
	icon: './assets/images/logo_fondo_transparente.png',
	scheme: 'ecomadapp',
	userInterfaceStyle: 'automatic',
	newArchEnabled: true,
	ios: {
		supportsTablet: true,
		bundleIdentifier: 'com.ecomad.app',
		buildNumber: process.env.IOS_BUILD_NUMBER ?? '1.0.3',
		requireFullScreen: true,
	},
	android: {
		adaptiveIcon: {
			foregroundImage: './assets/images/adaptive-icon.png',
			backgroundColor: '#ffffff',
		},
		edgeToEdgeEnabled: true,
		package: 'com.ecomad.app',
		versionCode: Number(process.env.ANDROID_VERSION_CODE) || 103,
	},
	web: {
		bundler: 'metro',
		output: 'static',
		favicon: './assets/images/favicon.png',
	},
	plugins: [
		'expo-router',
		[
			'expo-splash-screen',
			{
				image: './assets/images/splash-icon.png',
				imageWidth: 200,
				resizeMode: 'contain',
				backgroundColor: '#ffffff',
			},
		],
	],
	owner: 'ignacio68',
	experiments: {
		typedRoutes: true,
	},
	extra: {
		router: {},
		eas: {
			projectId: 'eeb844bb-6337-4cfd-890a-c3414df1da68',
		},
	},
})
