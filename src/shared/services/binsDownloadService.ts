import {
	getTotalCount,
	saveContainersData,
	saveHierarchyData,
	saveTotalCount,
} from '@/db/bins/service'
import { useSuperclusterCacheStore } from '@/features/map/stores/superclusterCacheStore'
import type { BinType } from '@/shared/types/bins'
import type { NearByCoordinates } from '@/shared/types/search'
import type { LngLatBounds } from '@map/types/mapData'
import { getAllBins, getBinsByNearby, getBinsCount } from './api/bins'

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
 * Función común para descargar y guardar todos los bins
 */
const downloadAndSaveBins = async (
	binType: BinType,
	onProgress?: (loaded: number, total: number) => void,
): Promise<{ success: boolean; count: number }> => {
	const response = await getAllBins(binType)

	if (!response.success || !response.data) {
		return { success: false, count: 0 }
	}

	const bins = response.data
	onProgress?.(bins.length, bins.length)

	await saveContainersData(binType, bins)
	const hierarchyData = calculateHierarchyData(bins)
	await saveHierarchyData(binType, hierarchyData)
	await saveTotalCount(binType, bins.length)

	const { clearPointsCache } = useSuperclusterCacheStore.getState()
	clearPointsCache(binType)

	return { success: true, count: bins.length }
}

/**
 * Descarga todos los bins en background (sin bloquear UI)
 */
const downloadAllBinsInBackground = async (binType: BinType): Promise<void> => {
	if (downloadingMutex.has(binType)) {
		return
	}

	downloadingMutex.add(binType)
	try {
		const result = await downloadAndSaveBins(binType)
		if (!result.success) {
			console.error(`❌ Background download failed for ${binType}`)
		}
	} catch (error) {
		console.error(`❌ Error in background download for ${binType}:`, error)
	} finally {
		downloadingMutex.delete(binType)
	}
}

/**
 * FASE 1: Descarga rápida inicial
 * Descarga solo el conteo total para mostrar datos inmediatamente
 */
export const loadInitialData = async (
	binType: BinType,
): Promise<{ success: boolean; count: number }> => {
	try {
		const cachedCount = await getTotalCount(binType)
		if (cachedCount !== null && cachedCount > 0) {
			return { success: true, count: cachedCount }
		}

		const countResponse = await getBinsCount(binType)

		if (
			!countResponse.data.success ||
			!countResponse.data.responseObject.count
		) {
			return { success: false, count: 0 }
		}

		const totalCount = countResponse.data.responseObject.count
		await saveTotalCount(binType, totalCount)

		return { success: true, count: totalCount }
	} catch (error) {
		console.error(`❌ Error loading initial data for ${binType}:`, error)
		return { success: false, count: 0 }
	}
}

/**
 * FASE 2: Descarga background automática
 * Descarga todos los contenedores en background para permitir uso offline
 * @param binType - Tipo de bin a descargar
 * @param skipCheck - Si es true, omite la verificación de totalCount (ya verificada antes)
 */
export const scheduleBackgroundDownload = async (
	binType: BinType,
	skipCheck = false,
): Promise<void> => {
	try {
		// Solo verificar si no se indica que ya se verificó antes
		if (!skipCheck) {
			const totalCount = await getTotalCount(binType)
			if (totalCount !== null && totalCount > 0) {
				return
			}
		}

		// Verificar mutex antes de programar
		if (downloadingMutex.has(binType)) {
			return
		}

		// Programar descarga inmediata (ya estamos en background)
		downloadAllBinsInBackground(binType)
	} catch (error) {
		console.error(
			`❌ Error scheduling background download for ${binType}:`,
			error,
		)
	}
}

/**
 * Descarga bins cercanos a una ubicación con radio y límite dinámicos
 * NO guarda en SQLite, solo devuelve los datos para mostrar en memoria
 * @param binType - Tipo de bin
 * @param coordinates - Coordenadas y radio (opcional, se calculará si no se proporciona)
 * @param bounds - Límites del viewport (para calcular radio dinámico)
 * @param zoom - Nivel de zoom (para calcular límite dinámico)
 */
export const loadNearbyBins = async (
	binType: BinType,
	coordinates: NearByCoordinates,
	bounds?: LngLatBounds,
	zoom?: number,
): Promise<{ success: boolean; count: number; data: any[] }> => {
	try {
		// Si se proporcionan bounds y zoom, calcular radio y límite dinámicos
		let dynamicRadius = coordinates.radius
		let dynamicLimit = 1000 // Default del backend

		if (bounds && zoom !== undefined) {
			const { calculateDynamicRadius, calculateLimit } = await import(
				'@map/services/binsLoader'
			)
			dynamicRadius = calculateDynamicRadius(bounds)
			dynamicLimit = calculateLimit(bounds, zoom)
		}

		const response = await getBinsByNearby(
			binType,
			{
				...coordinates,
				radius: dynamicRadius,
			},
			dynamicLimit,
		)

		if (!response.success || !response.data) {
			return { success: false, count: 0, data: [] }
		}

		// Los datos ya vienen limitados del backend
		const limitedData = response.data

		return {
			success: true,
			count: limitedData.length,
			data: limitedData,
		}
	} catch (error) {
		console.error(`❌ Error loading nearby bins for ${binType}:`, error)
		return { success: false, count: 0, data: [] }
	}
}
