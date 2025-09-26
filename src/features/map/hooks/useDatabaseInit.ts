import { initializeDatabase } from '@/db'
import { useEffect, useState } from 'react'

// Variable global para evitar múltiples inicializaciones
let isDbInitializing = false
let isDbInitialized = false

/**
 * Hook para inicializar la base de datos al cargar la app
 */
export const useDatabaseInit = () => {
	const [isInitialized, setIsInitialized] = useState(isDbInitialized)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		// Si ya está inicializada, no hacer nada
		if (isDbInitialized) {
			setIsInitialized(true)
			return
		}

		// Si ya se está inicializando, no hacer nada
		if (isDbInitializing) {
			return
		}

		const initDb = async () => {
			try {
				isDbInitializing = true
				console.log('🚀 Initializing database...')
				await initializeDatabase()
				isDbInitialized = true
				setIsInitialized(true)
				console.log('✅ Database initialized successfully')
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : 'Unknown error'
				console.error('❌ Failed to initialize database:', errorMessage)
				setError(errorMessage)
			} finally {
				isDbInitializing = false
			}
		}

		initDb()
	}, [])

	return { isInitialized, error }
}
