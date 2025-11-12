import { BinsService } from '@/db/bins/service'
import { INTERACTION_DELAY_MS } from '@/shared/constants/downloads'
import type { BinType } from '@/shared/types/bins'
import type { NearByCoordinates } from '@/shared/types/search'
import { InteractionManager } from 'react-native'
import { getAllBins, getBinsByNearby, getBinsCountsHierarchy } from './api/bins'

/**
 * Mutex para evitar descargas duplicadas
 */
const downloadingMutex = new Set<BinType>()

/**
 * Calcula datos jerárquicos a partir de bins individuales
 */
const calculateHierarchyData = (bins: any[]): any[] => {
	const hierarchy = new Map<
		string,
		{ distrito: string; barrio: string; count: number }
	>()

	for (const bin of bins) {
		const key = `${bin.district_code}-${bin.neighborhood_code}`

		if (hierarchy.has(key)) {
			hierarchy.get(key)!.count++
		} else {
			hierarchy.set(key, {
				distrito: bin.district_code,
				barrio: bin.neighborhood_code,
				count: 1,
			})
		}
	}

	return Array.from(hierarchy.values())
}

/**
 * Descarga todos los bins en background (sin bloquear UI)
 */
const downloadAllBinsInBackground = async (binType: BinType): Promise<void> => {
	// Verificar si ya hay una descarga en progreso
	if (downloadingMutex.has(binType)) {
		console.log(`⏭️ Background download already in progress for ${binType}`)
		return
	}

	downloadingMutex.add(binType)
	try {
		console.log(`📥 Starting background download for ${binType}...`)

		// 1. Descargar todos los bins del backend
		const response = await getAllBins(binType)

		if (!response.success || !response.data) {
			console.error(`❌ Background download failed for ${binType}`)
			return
		}

		const bins = response.data
		console.log(`✅ Downloaded ${bins.length} bins for ${binType}`)

		// 2. Guardar en SQLite (ya tiene batch insertion optimizado)
		await BinsService.saveContainersData(binType, bins)

		// 3. Calcular y guardar datos jerárquicos
		const hierarchyData = calculateHierarchyData(bins)
		await BinsService.saveHierarchyData(binType, hierarchyData)
		console.log(
			`✅ Calculated and saved ${hierarchyData.length} hierarchy groups`,
		)

		// 4. Actualizar conteo total
		await BinsService.saveTotalCount(binType, bins.length)

		console.log(
			`✅ Background download complete for ${binType}: ${bins.length} bins cached`,
		)
	} catch (error) {
		console.error(`❌ Error in background download for ${binType}:`, error)
	} finally {
		downloadingMutex.delete(binType)
	}
}

/**
 * Servicio para gestionar descargas de datos de bins
 * Implementa descarga rápida inicial + descarga background inteligente
 */
export const BinsDownloadService = {
	/**
	 * FASE 1: Descarga rápida inicial
	 * Descarga solo los conteos jerárquicos para mostrar datos inmediatamente
	 */
	loadInitialData: async (
		binType: BinType,
	): Promise<{ success: boolean; count: number }> => {
		try {
			console.log(`⚡ Loading initial data for ${binType}...`)

			// 1. Verificar si ya tenemos datos en cache
			const cachedCount = await BinsService.getTotalCount(binType)
			if (cachedCount !== null && cachedCount > 0) {
				console.log(
					`✅ Initial data already cached for ${binType}: ${cachedCount} bins`,
				)
				return { success: true, count: cachedCount }
			}

			// 2. Descargar conteos jerárquicos (muy rápido)
			console.log(`📥 Downloading hierarchy counts for ${binType}...`)
			const hierarchyData = await getBinsCountsHierarchy(binType)

			if (!hierarchyData.success || !hierarchyData.data) {
				console.error(`❌ Failed to load hierarchy data for ${binType}`)
				return { success: false, count: 0 }
			}

			// 3. Guardar en cache
			await BinsService.saveHierarchyData(binType, hierarchyData.data)

			// 4. Calcular total aproximado
			const totalCount = hierarchyData.data.reduce(
				(sum: number, item: { count: number }) => sum + item.count,
				0,
			)
			await BinsService.saveTotalCount(binType, totalCount)

			console.log(
				`✅ Initial data loaded for ${binType}: ${hierarchyData.data.length} groups, ~${totalCount} bins`,
			)

			return { success: true, count: totalCount }
		} catch (error) {
			console.error(`❌ Error loading initial data for ${binType}:`, error)
			return { success: false, count: 0 }
		}
	},

	/**
	 * FASE 2: Descarga background automática
	 * Descarga todos los contenedores en background para permitir uso offline
	 * El volumen de datos es ligero (~5-8MB total) y mejora significativamente la UX
	 */
	scheduleBackgroundDownload: async (binType: BinType): Promise<void> => {
		try {
			// 1. Verificar si ya tenemos todos los datos
			const cachedContainers = await BinsService.getContainersData(binType)
			if (cachedContainers && cachedContainers.length > 0) {
				console.log(
					`⏭️ Background download skipped: ${cachedContainers.length} bins already cached for ${binType}`,
				)
				return
			}

			// 2. Esperar a que termine la interacción del usuario
			console.log(
				`⏳ Scheduling background download for ${binType} after interactions...`,
			)

			InteractionManager.runAfterInteractions(() => {
				// Pequeño delay adicional para asegurar que la UI está libre
				setTimeout(() => {
					downloadAllBinsInBackground(binType)
				}, INTERACTION_DELAY_MS)
			})
		} catch (error) {
			console.error(
				`❌ Error scheduling background download for ${binType}:`,
				error,
			)
		}
	},

	/**
	 * Descarga completa manual (cuando el usuario la solicita explícitamente)
	 */
	downloadAllBinsNow: async (
		binType: BinType,
		onProgress?: (loaded: number, total: number) => void,
	): Promise<{ success: boolean; count: number }> => {
		try {
			console.log(`📥 Manual download started for ${binType}...`)

			// 1. Descargar todos los bins
			const response = await getAllBins(binType)

			if (!response.success || !response.data) {
				return { success: false, count: 0 }
			}

			const bins = response.data
			console.log(`✅ Downloaded ${bins.length} bins for ${binType}`)

			// 2. Reportar progreso (opcional)
			onProgress?.(bins.length, bins.length)

			// 3. Guardar en SQLite
			await BinsService.saveContainersData(binType, bins)

			// 4. Calcular y guardar datos jerárquicos
			const hierarchyData = calculateHierarchyData(bins)
			await BinsService.saveHierarchyData(binType, hierarchyData)
			console.log(
				`✅ Calculated and saved ${hierarchyData.length} hierarchy groups`,
			)

			// 5. Guardar conteo total
			await BinsService.saveTotalCount(binType, bins.length)

			console.log(
				`✅ Manual download complete for ${binType}: ${bins.length} bins`,
			)

			return { success: true, count: bins.length }
		} catch (error) {
			console.error(`❌ Error in manual download for ${binType}:`, error)
			return { success: false, count: 0 }
		}
	},

	/**
	 * Verifica si hay datos en cache para un tipo de bin
	 */
	hasCachedData: async (binType: BinType): Promise<boolean> => {
		const count = await BinsService.getTotalCount(binType)
		return count !== null && count > 0
	},

	/**
	 * Obtiene información sobre el estado de descarga
	 */
	getDownloadStatus: async (
		binType: BinType,
	): Promise<{
		hasCachedContainers: boolean
		hasCachedHierarchy: boolean
		totalCount: number
	}> => {
		const containers = await BinsService.getContainersData(binType)
		const hierarchy = await BinsService.getHierarchyData(binType)
		const totalCount = (await BinsService.getTotalCount(binType)) || 0

		return {
			hasCachedContainers: containers !== null && containers.length > 0,
			hasCachedHierarchy: hierarchy !== null && hierarchy.length > 0,
			totalCount,
		}
	},

	/**
	 * Descarga bins cercanos a una ubicación (para zoom alto inicial)
	 * NO guarda en SQLite, solo devuelve los datos para mostrar en memoria
	 * Útil cuando SQLite está vacía y el usuario está en zoom alto
	 */
	loadNearbyBins: async (
		binType: BinType,
		coordinates: NearByCoordinates,
	): Promise<{ success: boolean; count: number; data: any[] }> => {
		try {
			console.log(
				`📍 Loading nearby bins for ${binType} at (${coordinates.latitude}, ${coordinates.longitude}) radius: ${coordinates.radius}km`,
			)

			// Descargar bins cercanos
			const response = await getBinsByNearby(binType, coordinates)

			if (!response.success || !response.data) {
				console.warn(`⚠️ No nearby bins found for ${binType}`)
				return { success: false, count: 0, data: [] }
			}

			const bins = response.data
			console.log(
				`✅ Downloaded ${bins.length} nearby bins for ${binType} (in-memory only)`,
			)

			return { success: true, count: bins.length, data: bins }
		} catch (error) {
			console.error(`❌ Error loading nearby bins for ${binType}:`, error)
			return { success: false, count: 0, data: [] }
		}
	},
}
