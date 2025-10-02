import { BinsContainersCacheRecord } from '@/db/bins/schema'
import { BinType } from '@/shared/types/bins'
import { useCallback, useState } from 'react'
import {
	clearCache,
	downloadAndCacheData,
	ensureDataAvailable,
	ensureDataAvailableAndGetContainers,
	isDataCached,
	loadFromCache,
} from '../services/binsCacheService'
import { useBinsCountStore } from '../stores/binsCountStore'

export const useLocalBinsCache = () => {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const { setTotalCount, setHierarchyData } = useBinsCountStore()

	/**
	 * Verificar si los datos están en cache local
	 */
	const isDataCachedWrapper = useCallback(
		async (binType: BinType): Promise<boolean> => {
			return isDataCached(binType)
		},
		[],
	)

	/**
	 * Descargar y almacenar todos los datos para un tipo de contenedor
	 */
	const downloadAndCacheDataWrapper = useCallback(
		async (binType: BinType): Promise<void> => {
			setIsLoading(true)
			setError(null)

			try {
				await downloadAndCacheData(binType)
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'Unknown error'
				setError(errorMessage)
				throw error
			} finally {
				setIsLoading(false)
			}
		},
		[],
	)

	/**
	 * Cargar datos desde cache local
	 */
	const loadFromCacheWrapper = useCallback(
		async (binType: BinType): Promise<void> => {
			return loadFromCache(binType)
		},
		[],
	)

	/**
	 * Función principal: verificar cache y cargar/descargar datos según sea necesario
	 */
	const ensureDataAvailableWrapper = useCallback(
		async (binType: BinType): Promise<void> => {
			return ensureDataAvailable(binType)
		},
		[],
	)

	/**
	 * Función optimizada: verificar cache y devolver containers si están disponibles
	 */
	const ensureDataAvailableAndGetContainersWrapper = useCallback(
		async (binType: BinType): Promise<BinsContainersCacheRecord[] | null> => {
			return ensureDataAvailableAndGetContainers(binType)
		},
		[],
	)

	/**
	 * Limpiar cache para un tipo específico
	 */
	const clearCacheWrapper = useCallback(
		async (binType: BinType): Promise<void> => {
			return clearCache(binType)
		},
		[],
	)

	return {
		isLoading,
		error,
		isDataCached: isDataCachedWrapper,
		downloadAndCacheData: downloadAndCacheDataWrapper,
		loadFromCache: loadFromCacheWrapper,
		ensureDataAvailable: ensureDataAvailableWrapper,
		ensureDataAvailableAndGetContainers:
			ensureDataAvailableAndGetContainersWrapper,
		clearCache: clearCacheWrapper,
	}
}
