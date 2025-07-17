import "../../global.css";

import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync().catch(console.warn)

export default function RootLayout() {
	useEffect(() => {
		console.log('RootLayout')
	}, [])

		const [loaded, error] = useFonts({
			'Lato-Regular': require('../assets/fonts/Lato2OFL/Lato-Regular.ttf'),
			'Lato-Light': require('../assets/fonts/Lato2OFL/Lato-Light.ttf'),
			'Lato-Medium': require('../assets/fonts/Lato2OFL/Lato-Medium.ttf'),
			'Lato-Semibold': require('../assets/fonts/Lato2OFL/Lato-Semibold.ttf'),
			'Lato-Bold': require('../assets/fonts/Lato2OFL/Lato-Bold.ttf'),
		})

   useEffect(() => {
			if (error) throw error
		}, [error])

		useEffect(() => {
			if (loaded) {
				SplashScreen.hideAsync().catch(console.warn)
			}
		}, [loaded])

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
		<SafeAreaProvider>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="index" options={{ headerShown: false }} />
			</Stack>
			<StatusBar translucent={true} style="auto" />
		</SafeAreaProvider>
	)
}
