import { getClothingBinsCountByDistrict } from '@/shared/services/api/bins/clothingApi'
import * as SQLite from 'expo-sqlite'
import { useCallback, useEffect, useState } from 'react'

// Tipos para los datos del caché
interface DistrictData {
	distrito: string
	count: number
	centroid: { lat: number; lng: number }
}

// Caché simple integrado
class SimpleCache {
	private static db: SQLite.SQLiteDatabase | null = null

	static async init() {
		if (this.db) return this.db

		console.log('🗄️ Initializing SQLite cache database...')
		this.db = await SQLite.openDatabaseAsync('ecomad_cache.db')

		// Crear tabla
		await this.db.execAsync(`
			CREATE TABLE IF NOT EXISTS district_cache (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				distrito TEXT NOT NULL UNIQUE,
				count INTEGER NOT NULL,
				centroid_lat REAL NOT NULL,
				centroid_lng REAL NOT NULL,
				created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
			)
		`)

		console.log('✅ Cache database initialized')
		return this.db
	}

	static async getDistricts(): Promise<DistrictData[]> {
		const db = await this.init()

		try {
			console.log('🗄️ Fetching districts from cache...')
			const result = (await db.getAllAsync(`
				SELECT distrito, count, centroid_lat, centroid_lng
				FROM district_cache
				ORDER BY distrito
			`)) as any[]

			if (result.length === 0) {
				console.log('📭 No cached districts found')
				return []
			}

			console.log(`✅ Found ${result.length} cached districts`)
			return result.map(row => ({
				distrito: row.distrito,
				count: row.count,
				centroid: {
					lat: row.centroid_lat,
					lng: row.centroid_lng,
				},
			}))
		} catch (error) {
			console.error('❌ Error fetching districts from cache:', error)
			return []
		}
	}

	static async saveDistricts(districts: DistrictData[]): Promise<void> {
		const db = await this.init()

		try {
			console.log(`💾 Saving ${districts.length} districts to cache...`)

			// Limpiar cache existente
			await db.runAsync('DELETE FROM district_cache')

			// Insertar nuevos datos
			for (const district of districts) {
				await db.runAsync(
					'INSERT INTO district_cache (distrito, count, centroid_lat, centroid_lng) VALUES (?, ?, ?, ?)',
					[
						district.distrito,
						district.count,
						district.centroid.lat,
						district.centroid.lng,
					],
				)
			}

			console.log('✅ Districts saved to cache successfully')
		} catch (error) {
			console.error('❌ Error saving districts to cache:', error)
			throw error
		}
	}

	static async clearCache(): Promise<void> {
		const db = await this.init()

		try {
			console.log('🧹 Clearing SQLite cache...')
			await db.runAsync('DELETE FROM district_cache')
			console.log('✅ Cache cleared successfully')
		} catch (error) {
			console.error('❌ Error clearing cache:', error)
			throw error
		}
	}
}

export interface MapData {
	data: DistrictData[]
	loading: boolean
	error: string | null
}

export const useMapDataByZoom = (enabled: boolean = false) => {
	const [mapData, setMapData] = useState<MapData>({
		data: [],
		loading: false,
		error: null,
	})

	const fetchData = useCallback(async () => {
		console.log('🔍 fetchData called (with SQLite cache)')

		if (!enabled) {
			console.log('🚫 Data fetching disabled, skipping fetch')
			return
		}

		// Verificar si ya tenemos datos cargados en memoria
		if (mapData.data && mapData.data.length > 0) {
			console.log('✅ Data already loaded in memory, skipping fetch')
			return
		}

		setMapData(prev => ({ ...prev, loading: true, error: null }))

		try {
			// 1. Intentar obtener datos del caché primero
			console.log('🗄️ Checking SQLite cache for districts...')
			const cachedData = await SimpleCache.getDistricts()

			if (cachedData.length > 0) {
				console.log('✅ Using cached districts from SQLite:', cachedData.length)
				setMapData({
					data: cachedData,
					loading: false,
					error: null,
				})
				return
			}

			// 2. Si no hay caché, obtener del API y guardar en caché
			console.log('🌐 Cache miss - fetching from API...')
			const response = await getClothingBinsCountByDistrict()
			const apiData = response.data

			console.log('✅ API data received:', apiData.length, 'districts')

			// 3. Guardar en caché para futuras consultas
			await SimpleCache.saveDistricts(apiData)

			setMapData({
				data: apiData,
				loading: false,
				error: null,
			})
		} catch (error) {
			console.error('Error fetching map data:', error)
			setMapData({
				data: [],
				loading: false,
				error: error instanceof Error ? error.message : 'Error desconocido',
			})
		}
	}, [enabled, mapData.data])

	// Refetch cuando cambien los parámetros
	useEffect(() => {
		fetchData()
	}, [fetchData])

	return {
		mapData,
		refetch: fetchData,
	}
}
