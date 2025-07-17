import { ConfigContext, ExpoConfig } from '@expo/config'
import 'dotenv/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
	...config,
	name: 'ecomad-app',
	slug: 'ecomad-app',
	version: process.env.APP_VERSION ?? '1.0.3',
	orientation: 'portrait',
	icon: './src/assets/images/logo_fondo_transparente.png',
	scheme: 'com.ecomad.app',
	userInterfaceStyle: 'automatic',
	newArchEnabled: true,
	assetBundlePatterns: ['src/assets/**/*'],
	splash: {
		image: './src/assets/images/splash.png',
		resizeMode: 'contain',
		backgroundColor: '#ffffff',
	},
	ios: {
		supportsTablet: true,
		bundleIdentifier: 'com.ecomad.app',
		buildNumber: process.env.IOS_BUILD_NUMBER ?? '1.0.3',
		requireFullScreen: true,
	},
	android: {
		adaptiveIcon: {
			foregroundImage: './src/assets/images/adaptive-icon.png',
			backgroundColor: '#ffffff',
		},
		edgeToEdgeEnabled: true,
		package: 'com.ecomad.app',
		versionCode: Number(process.env.ANDROID_VERSION_CODE) || 103,
	},
	web: {
		bundler: 'metro',
		output: 'static',
		favicon: './src/assets/images/favicon.png',
	},
	plugins: [
		'expo-router',
		[
			'expo-splash-screen',
			{
				image: './src/assets/images/splash-icon.png',
				imageWidth: 200,
				resizeMode: 'contain',
				backgroundColor: '#ffffff',
			},
		],
		'expo-font',
		[
			'@rnmapbox/maps',
			{
				RNMapboxMapsDownloadToken: process.env.MAPBOX_SECRET_TOKEN as string,
				RNMapboxMapsVersion: "11.0.0", // opcional
			},
		],
	],
	owner: 'ignacio68',
	experiments: {
		typedRoutes: true,
	},
	runtimeVersion: {
		policy: 'appVersion',
	},
	extra: {
		router: {},
		eas: {
			projectId: 'eeb844bb-6337-4cfd-890a-c3414df1da68',
		},
		MAPBOX_SECRET_TOKEN: process.env.MAPBOX_SECRET_TOKEN as string,
	},
})
