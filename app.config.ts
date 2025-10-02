import { ConfigContext, ExpoConfig } from '@expo/config'
import { isAndroid } from '@rnmapbox/maps/lib/typescript/src/utils'
import 'dotenv/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
	...config,
	name: 'EcoMAD',
	slug: 'ecomad-app',
	version: process.env.APP_VERSION ?? '1.0.3',
	orientation: 'portrait',
	icon: './src/assets/images/icon.png',
	scheme: 'com.ecomad.app',
	userInterfaceStyle: 'light',
	backgroundColor: '#ffffff',
	newArchEnabled: true,
	// splash: {
	// 	image: './src/assets/images/splash-icon.png',
	// 	resizeMode: 'contain',
	// 	backgroundColor: '#3D9970',
	// },
	ios: {
		supportsTablet: true,
		bundleIdentifier: 'com.ecomad.app',
		buildNumber: process.env.IOS_BUILD_NUMBER ?? '1.0.3',
		requireFullScreen: true,
		userInterfaceStyle: 'light',
		infoPlist: {
			UIUserInterfaceStyle: 'light',
			NSLocationWhenInUseUsageDescription:
				'Permite que la aplicación acceda a su ubicación siempre y cuando esté en uso',
		},
	},
	android: {
		// adaptiveIcon: {
		// 	foregroundImage: './src/assets/images/adaptive-icon.png',
		// 	backgroundColor: '#ffffff',
		// },
		edgeToEdgeEnabled: true,
		package: 'com.ecomad.app',
		versionCode: Number(process.env.ANDROID_VERSION_CODE) || 103,
		userInterfaceStyle: 'light',
		permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
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
				backgroundColor: '#3D9970',
			},
		],
		'expo-font',
		[
			'@rnmapbox/maps',
			{
				RNMapboxMapsDownloadToken: process.env.MAPBOX_DOWNLOADS_TOKEN as string,
				RNMapboxMapsVersion: '11.14.4',
			},
		],
		[
			'expo-location',
			{
				locationAlwaysAndWhenInUsePermission:
					'Permite que la aplicación acceda a su ubicación siempre y cuando esté en uso',
				locationWhenInUsePermission:
					'Permite que la aplicación acceda a su ubicación cuando esté en uso',
			},
		],
		[
			'expo-dev-client',
			{
				launchMode: 'most-recent',
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
	updates: {
		assetPatternsToBeBundled: [
			'./src/assets/fonts/**/*.ttf',
			'./src/assets/images/**/*.png',
			'./src/assets/icons/**/*.svg',
		],
	},
	extra: {
		router: {},
		eas: {
			projectId: 'eeb844bb-6337-4cfd-890a-c3414df1da68',
		},
		MAPBOX_DOWNLOADS_TOKEN: process.env.MAPBOX_DOWNLOADS_TOKEN as string,
	},
})
