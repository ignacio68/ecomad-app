import { Platform } from 'react-native'

// Configuración de la API
export const API_CONFIG = {
	// URLs base para diferentes entornos
	URLS: {
		// Para desarrollo local
		LOCAL: 'http://localhost:3000',
		// Para Android emulador
		ANDROID_EMULATOR: 'http://10.0.2.2:3000',
		// Para iOS simulator
		IOS_SIMULATOR: 'http://localhost:3000',
		// Para dispositivo físico (necesitarás la IP de tu máquina)
		DEVICE: 'http://192.168.1.100:3000', // Cambia esta IP por la de tu máquina
	},

	// Función para obtener la URL correcta
	getBaseURL: () => {
		// Si hay variable de entorno, usarla
		if (process.env.EXPO_PUBLIC_API_BASE_URL) {
			return process.env.EXPO_PUBLIC_API_BASE_URL
		}

		if (process.env.API_BASE_URL) {
			return process.env.API_BASE_URL
		}

		// Detectar plataforma y entorno
		if (Platform.OS === 'android') {
			return API_CONFIG.URLS.ANDROID_EMULATOR
		}

		if (Platform.OS === 'ios') {
			return API_CONFIG.URLS.IOS_SIMULATOR
		}

		// Fallback
		return API_CONFIG.URLS.LOCAL
	},
}

// Exportar la URL base
export const API_BASE_URL = API_CONFIG.getBaseURL()

// Debug info
console.log('🔧 API Configuration:')
console.log('🔧 Platform:', Platform.OS)
console.log('🔧 Base URL:', API_BASE_URL)
console.log('🔧 Environment variables:')
console.log(
	'  - EXPO_PUBLIC_API_BASE_URL:',
	process.env.EXPO_PUBLIC_API_BASE_URL,
)
console.log('  - API_BASE_URL:', process.env.API_BASE_URL)
console.log('  - NODE_ENV:', process.env.NODE_ENV)
