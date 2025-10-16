import '../../global.css'

import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator, Appearance, View } from 'react-native'
import 'react-native-reanimated'
import { useEffect, useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { setMapboxAccessToken } from '../features/map/services/mapService'
import { useDatabaseInit } from '../shared/hooks/useDatabaseInit'

SplashScreen.preventAutoHideAsync().catch(console.warn)

export default function RootLayout() {
	const { isInitialized: dbInitialized, error: dbError } = useDatabaseInit()
	const [mapboxInitialized, setMapboxInitialized] = useState(false)

	// Inicializar Mapbox token ANTES de renderizar cualquier componente
	useEffect(() => {
		console.log('🗺️ Initializing Mapbox token...')
		setMapboxAccessToken()
		setMapboxInitialized(true)
	}, [])

	useEffect(() => {
		console.log('RootLayout')
		Appearance.setColorScheme('light')
	}, [])

	const [loaded, error] = useFonts({
		'Lato-Regular': require('../assets/fonts/Lato-Regular.ttf'),
		'Lato-Light': require('../assets/fonts/Lato-Light.ttf'),
		'Lato-Medium': require('../assets/fonts/Lato-Medium.ttf'),
		'Lato-Semibold': require('../assets/fonts/Lato-Semibold.ttf'),
		'Lato-Bold': require('../assets/fonts/Lato-Bold.ttf'),
		'Lato-Italic': require('../assets/fonts/Lato-Italic.ttf'),
	})

	useEffect(() => {
		if (error) {
			console.error('Error loading fonts:', error)
			throw error
		}
	}, [error])

	useEffect(() => {
		if (loaded) {
			console.log('Fonts loaded successfully')
			SplashScreen.hideAsync().catch(console.warn)
		}
	}, [loaded])

	if (!loaded || !dbInitialized || !mapboxInitialized) {
		console.log('Loading:', {
			fonts: loaded,
			database: dbInitialized,
			mapbox: mapboxInitialized,
		})
		return (
			<View className="flex-1 items-center justify-center">
				<ActivityIndicator size="large" color="#7251BC" />
			</View>
		)
	}

	if (dbError) {
		console.error('Database initialization error:', dbError)
		// Continuar sin base de datos por ahora
	}

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaProvider>
				<Stack screenOptions={{ headerShown: false }}>
					<Stack.Screen name="index" options={{ headerShown: false }} />
					<Stack.Screen name="(app)/map" options={{ headerShown: false }} />
				</Stack>
				<StatusBar translucent={true} style="dark" />
			</SafeAreaProvider>
		</GestureHandlerRootView>
	)
}
