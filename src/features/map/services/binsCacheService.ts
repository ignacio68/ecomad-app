import { clearCache as clearCacheFromService } from '@/db/bins/service'
import {
	loadInitialData,
	scheduleBackgroundDownload,
} from '@/shared/services/binsDownloadService'
import type { BinType } from '@/shared/types/bins'
import { useBinsCountStore } from '@map/stores/binsCountStore'
import { clearGeoJsonCache } from '@map/services/geoJsonCacheService'

const loadingMutex = new Map<BinType, Promise<void>>()

/**
 * Estrategia de carga híbrida:
 * 1. Carga inicial rápida (conteo total)
 * 2. Descarga background automática (todos los bins para uso offline)
 */
const getNewOperation = async (binType: BinType): Promise<void> => {
	try {
		if (__DEV__) {
			console.log(`🔄 Starting ensureDataAvailable for ${binType}`)
		}

		// FASE 1: Carga inicial rápida (siempre)
		const initialData = await loadInitialData(binType)

		if (initialData.success && initialData.count > 0) {
			// Actualizar store con el conteo
			useBinsCountStore.getState().setTotalCount(binType, initialData.count)
		}

		// FASE 2: Programar descarga background
		// skipCheck=true porque loadInitialData ya verificó getTotalCount
		// Esto NO bloquea, se ejecuta en background
		scheduleBackgroundDownload(binType, true)

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
		await clearCacheFromService(binType)
		await clearGeoJsonCache(binType)
		console.log(`✅ Cleared cache for ${binType}`)
	} catch (error) {
		console.error(`❌ Error clearing cache for ${binType}:`, error)
		throw error
	}
}
