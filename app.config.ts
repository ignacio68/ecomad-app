import { ConfigContext, ExpoConfig } from '@expo/config'
import 'dotenv/config'

const ENV = (process.env.APP_ENV as 'dev' | 'staging' | 'prod') ?? 'dev'

const byEnv = {
	dev: { name: 'EcoMAD (Dev)', slug: 'ecomad-dev', channel: 'dev' },
	staging: {
		name: 'EcoMAD (Staging)',
		slug: 'ecomad-staging',
		channel: 'staging',
	},
	prod: { name: 'EcoMAD', slug: 'ecomad-app', channel: 'prod' },
} as const

export default ({ config }: ConfigContext): ExpoConfig => {
	const projectId = 'eeb844bb-6337-4cfd-890a-c3414df1da68'

	return {
		...config,
		name: byEnv[ENV].name,
		slug: byEnv[ENV].slug,
		version: process.env.APP_VERSION ?? '1.0.7',
		orientation: 'portrait',
		icon: './src/assets/images/icon.png',
		scheme: 'ecomad',
		userInterfaceStyle: 'light',
		backgroundColor: '#ffffff',
		newArchEnabled: true,
		ios: {
			...(config.ios ?? {}),
			supportsTablet: true,
			bundleIdentifier: 'com.ecomad.app',
			buildNumber: process.env.IOS_BUILD_NUMBER ?? '1.0.7',
			requireFullScreen: true,
			userInterfaceStyle: 'light',
			infoPlist: {
				UIUserInterfaceStyle: 'light',
				NSLocationWhenInUseUsageDescription:
					'Permite que la aplicación acceda a su ubicación siempre y cuando esté en uso',
			},
		},
		android: {
			...(config.android ?? {}),
			// adaptiveIcon: {
			// 	foregroundImage: './src/assets/images/adaptive-icon.png',
			// 	backgroundColor: '#ffffff',
			// },
			edgeToEdgeEnabled: true,
			package: 'com.ecomad.app',
			versionCode: Number(process.env.ANDROID_VERSION_CODE) || 107,
			userInterfaceStyle: 'light',
			permissions: [
				'ACCESS_FINE_LOCATION',
				'ACCESS_COARSE_LOCATION',
				// 'ACCESS_BACKGROUND_LOCATION',
			],
		},
		web: {
			...(config.web ?? {}),
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
				'expo-sqlite',
				{
					enableFTS: true, // Full Text Search
					useSQLCipher: false, // No necesitamos encriptación por ahora
				},
			],
			[
				'@rnmapbox/maps',
				{
					RNMapboxMapsDownloadToken: process.env
						.EXPO_PUBLIC_MAPBOX_DOWNLOADS_TOKEN as string,
					RNMapboxMapsVersion: '11.16.2',
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
			// [
			// 	'expo-asset',
			// 	{
			// 		assets: ['./src/assets/images/**/*.png', './src/features/map/assets/images/**/*.png'],
			// 	},
			// ],
		],
		owner: 'ignacio68',
		experiments: {
			typedRoutes: true,
		},
		runtimeVersion: { policy: 'sdkVersion' },
		assetBundlePatterns: [
			'./src/assets/fonts/**/*',
			'./src/assets/images/**/*',
			'./src/assets/icons/**/*',
		],
		updates: {},
		extra: {
			...(config.extra ?? {}),
			router: {},
			eas: {
				projectId,
			},
			MAPBOX_DOWNLOADS_TOKEN: process.env
				.EXPO_PUBLIC_MAPBOX_DOWNLOADS_TOKEN as string,
			API_URL: process.env.API_URL ?? '',
		},
	}
}
