import { BinsService } from '@/db/bins/service'
import { BinsDownloadService } from '@/shared/services/binsDownloadService'
import { BinType } from '@/shared/types/bins'
import { useBinsCountStore } from '@map/stores/binsCountStore'

const loadingMutex = new Map<BinType, Promise<void>>()

/**
 * Verifica si hay datos en cache (solo conteo inicial)
 */
export const isDataCached = async (binType: BinType): Promise<boolean> => {
	return await BinsDownloadService.hasCachedData(binType)
}

/**
 * @deprecated Use BinsDownloadService.downloadAllBinsNow() instead
 * Esta función se mantiene por compatibilidad pero internamente usa el nuevo servicio
 */
export const downloadAndCacheData = async (binType: BinType): Promise<void> => {
	const result = await BinsDownloadService.downloadAllBinsNow(binType)
	if (!result.success) {
		throw new Error(`Failed to download and cache data for ${binType}`)
	}
}

/**
 * Estrategia de carga híbrida:
 * 1. Carga inicial rápida (conteos jerárquicos)
 * 2. Descarga background inteligente (si hay WiFi + batería)
 */
const getNewOperation = async (binType: BinType): Promise<void> => {
	try {
		if (__DEV__) {
			console.log(`🔄 Starting ensureDataAvailable for ${binType}`)
		}

		// FASE 1: Carga inicial rápida (siempre)
		const initialData = await BinsDownloadService.loadInitialData(binType)
		
		if (initialData.success && initialData.count > 0) {
			// Actualizar store con el conteo
			useBinsCountStore.getState().setTotalCount(binType, initialData.count)
		}

		// FASE 2: Programar descarga background (si condiciones son adecuadas)
		// Esto NO bloquea, se ejecuta en background
		BinsDownloadService.scheduleBackgroundDownload(binType)

		console.log(`✅ Completed ensureDataAvailable for ${binType}`)
	} catch (error) {
		console.error(`❌ Error ensuring data availability for ${binType}:`, error)
		throw error
	} finally {
		loadingMutex.delete(binType)
	}
}

/**
 * Asegura que los datos estén disponibles
 * Usa estrategia híbrida: carga rápida inicial + background download
 */
export const ensureDataAvailable = async (binType: BinType): Promise<void> => {
	if (loadingMutex.has(binType)) {
		console.log(`⏳ Waiting for existing operation for ${binType}...`)
		return loadingMutex.get(binType)!
	}

	const operation = getNewOperation(binType)
	loadingMutex.set(binType, operation)
	return operation
}

export const clearCache = async (binType: BinType): Promise<void> => {
	try {
		await BinsService.clearCache(binType)
		console.log(`✅ Cleared cache for ${binType}`)
	} catch (error) {
		console.error(`❌ Error clearing cache for ${binType}:`, error)
		throw error
	}
}
