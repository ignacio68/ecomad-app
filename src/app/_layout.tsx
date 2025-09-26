import '../../global.css'

import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ActivityIndicator, Appearance, View } from 'react-native'
import 'react-native-reanimated'

import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useDatabaseInit } from '../features/map/hooks/useDatabaseInit'

SplashScreen.preventAutoHideAsync().catch(console.warn)

export default function RootLayout() {
	// Inicializar base de datos
	const { isInitialized: dbInitialized, error: dbError } = useDatabaseInit()

	useEffect(() => {
		console.log('RootLayout')
		// Forzar modo claro
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

	if (!loaded || !dbInitialized) {
		// Esperar a que se carguen las fuentes y se inicialice la base de datos
		console.log('Loading:', { fonts: loaded, database: dbInitialized })
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
				<StatusBar translucent={true} style="light" />
			</SafeAreaProvider>
		</GestureHandlerRootView>
	)
}
