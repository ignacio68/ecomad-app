import { initializeDatabase } from '@/db'
import { useEffect, useState } from 'react'
import { Platform } from 'react-native'

// Variable global para evitar múltiples inicializaciones
let isDbInitializing = false
let isDbInitialized = false

// Timeout más largo para Android en el primer arranque
const DB_INIT_TIMEOUT = Platform.OS === 'android' ? 10000 : 5000

// Helper para crear una promesa con timeout
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
	const timeoutPromise = new Promise<T>((_, reject) =>
		setTimeout(
			() => reject(new Error('Database initialization timeout')),
			timeoutMs,
		),
	)
	return Promise.race([promise, timeoutPromise])
}

export const useDatabaseInit = () => {
	const [isInitialized, setIsInitialized] = useState(isDbInitialized)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (isDbInitialized) {
			setIsInitialized(true)
			return
		}

		if (isDbInitializing) {
			return
		}

		const initDb = async () => {
			isDbInitializing = true
			console.log('🚀 Initializing database...', {
				platform: Platform.OS,
				timeout: DB_INIT_TIMEOUT,
			})

			try {
				await withTimeout(initializeDatabase(), DB_INIT_TIMEOUT)

				isDbInitialized = true
				setIsInitialized(true)
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : 'Unknown error'
				console.error('❌ Failed to initialize database:', errorMessage)
				setError(errorMessage)
				// En caso de error, permitir continuar sin base de datos
				// La app puede funcionar sin cache local
				isDbInitialized = true
				setIsInitialized(true)
			} finally {
				isDbInitializing = false
			}
		}

		initDb()
	}, [])

	return { isInitialized, error }
}
