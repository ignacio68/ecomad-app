import { BinsContainersCacheRecord } from '@/db/bins/schema'
import { BinsService } from '@/db/bins/service'
import { getAllBins, getBinsCountsHierarchy } from '@/shared/services/api/bins'
import { BinType } from '@/shared/types/bins'
import { useCallback, useState } from 'react'
import { useBinsCountStore } from '../stores/binsCountStore'

// Mutex para evitar llamadas concurrentes a ensureDataAvailable
const loadingMutex = new Map<BinType, Promise<void>>()

export const useLocalBinsCache = () => {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const { setTotalCount, setHierarchyData } = useBinsCountStore()

	/**
	 * Verificar si los datos están en cache local
	 */
	const isDataCached = useCallback(
		async (binType: BinType): Promise<boolean> => {
			try {
				const totalCount = await BinsService.getTotalCount(binType)
				const hierarchyData = await BinsService.getHierarchyData(binType)
				const containers = await BinsService.getContainersData(binType)

				const isCached =
					totalCount !== null &&
					hierarchyData !== null &&
					hierarchyData.length > 0 &&
					containers !== null &&
					containers.length > 0

				console.log(`🔍 Cache check for ${binType}:`, {
					totalCount: totalCount !== null,
					hierarchyData: hierarchyData !== null && hierarchyData.length > 0,
					containers: containers !== null && containers.length > 0,
					isCached,
				})

				return isCached
			} catch (error) {
				console.error(`❌ Error checking cache for ${binType}:`, error)
				return false
			}
		},
		[],
	)

	/**
	 * Descargar y almacenar todos los datos para un tipo de contenedor
	 */
	const downloadAndCacheData = useCallback(
		async (binType: BinType): Promise<void> => {
			setIsLoading(true)
			setError(null)

			try {
				if (__DEV__) {
					console.log(`🔄 Downloading and caching data for ${binType}...`)
				}

				// 1. Descargar todos los contenedores
				console.log(`📥 Downloading all bins for ${binType}...`)
				const allBinsResponse = await getAllBins(binType)

				if (!allBinsResponse.success) {
					throw new Error(`Failed to download bins: ${allBinsResponse.message}`)
				}

				const allBins = allBinsResponse.data
				console.log(`✅ Downloaded ${allBins.length} bins for ${binType}`)

				// 2. Almacenar contenedores en cache local
				console.log(`💾 Saving ${allBins.length} containers to database...`)
				await BinsService.saveContainersData(binType, allBins)
				console.log(`✅ Containers saved to database`)

				// 3. Descargar datos jerárquicos
				console.log(`📥 Downloading hierarchy data for ${binType}...`)
				const hierarchyResponse = await getBinsCountsHierarchy(binType)

				if (!hierarchyResponse.success) {
					throw new Error(
						`Failed to download hierarchy data: ${hierarchyResponse.message}`,
					)
				}

				const hierarchyData = hierarchyResponse.data
				console.log(
					`✅ Downloaded ${hierarchyData.length} hierarchy records for ${binType}`,
				)

				// 4. Almacenar datos jerárquicos en cache local
				await BinsService.saveHierarchyData(binType, hierarchyData)

				// 5. Calcular y almacenar conteo total
				const totalCount = allBins.length
				await BinsService.saveTotalCount(binType, totalCount)

				// 6. Actualizar stores de Zustand
				setTotalCount(binType, totalCount)
				setHierarchyData(binType, hierarchyData)

				console.log(`✅ Successfully cached data for ${binType}`)
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'Unknown error'
				console.error(
					`❌ Error downloading and caching data for ${binType}:`,
					errorMessage,
				)
				setError(errorMessage)
				throw error
			} finally {
				setIsLoading(false)
			}
		},
		[setTotalCount, setHierarchyData],
	)

	/**
	 * Cargar datos desde cache local
	 */
	const loadFromCache = useCallback(
		async (binType: BinType): Promise<void> => {
			try {
				console.log(`📂 Loading data from cache for ${binType}...`)

				// Cargar conteo total
				const totalCount = await BinsService.getTotalCount(binType)
				if (totalCount !== null) {
					setTotalCount(binType, totalCount)
				}

				// Cargar datos jerárquicos
				const hierarchyData = await BinsService.getHierarchyData(binType)
				if (hierarchyData !== null) {
					setHierarchyData(binType, hierarchyData)
				}

				console.log(`✅ Loaded data from cache for ${binType}`)
			} catch (error) {
				console.error(`❌ Error loading from cache for ${binType}:`, error)
				throw error
			}
		},
		[setTotalCount, setHierarchyData],
	)

	/**
	 * Función principal: verificar cache y cargar/descargar datos según sea necesario
	 */
	const ensureDataAvailable = useCallback(
		async (binType: BinType): Promise<void> => {
			// Verificar si ya hay una operación en curso para este binType
			if (loadingMutex.has(binType)) {
				console.log(`⏳ Waiting for existing operation for ${binType}...`)
				return loadingMutex.get(binType)!
			}

			// Crear nueva operación
			const operation = (async () => {
				try {
					if (__DEV__) {
						console.log(`🔄 Starting ensureDataAvailable for ${binType}`)
					}
					console.log(
						`📍 Call stack:`,
						new Error().stack?.split('\n').slice(1, 4).join('\n'),
					)

					// Verificar si los datos están en cache local
					const isCached = await isDataCached(binType)

					if (isCached) {
						console.log(
							`✅ ensureDataAvailable::Data already cached for ${binType}`,
						)
						await loadFromCache(binType)
					} else {
						console.log(`📥 Data not cached for ${binType}, downloading...`)
						await downloadAndCacheData(binType)
					}

					console.log(`✅ Completed ensureDataAvailable for ${binType}`)
				} catch (error) {
					console.error(
						`❌ Error ensuring data availability for ${binType}:`,
						error,
					)
					throw error
				} finally {
					// Limpiar mutex cuando termine la operación
					loadingMutex.delete(binType)
				}
			})()

			// Guardar la operación en el mutex
			loadingMutex.set(binType, operation)
			return operation
		},
		[isDataCached, loadFromCache, downloadAndCacheData],
	)

	/**
	 * Función optimizada: verificar cache y devolver containers si están disponibles
	 */
	const ensureDataAvailableAndGetContainers = useCallback(
		async (binType: BinType): Promise<BinsContainersCacheRecord[] | null> => {
			try {
				// Verificar si los datos están en cache local
				const isCached = await isDataCached(binType)

				if (isCached) {
					console.log(
						`✅ ensureDataAvailableAndGetContainers::Data already cached for ${binType}`,
					)
					await loadFromCache(binType)
					// Devolver containers ya verificados
					return await BinsService.getContainersData(binType)
				} else {
					console.log(`📥 Data not cached for ${binType}, downloading...`)
					await downloadAndCacheData(binType)
					// Devolver containers recién descargados
					return await BinsService.getContainersData(binType)
				}
			} catch (error) {
				console.error(
					`❌ Error ensuring data availability for ${binType}:`,
					error,
				)
				throw error
			}
		},
		[isDataCached, loadFromCache, downloadAndCacheData],
	)

	/**
	 * Limpiar cache para un tipo específico
	 */
	const clearCache = useCallback(async (binType: BinType): Promise<void> => {
		try {
			await BinsService.clearCache(binType)
			console.log(`✅ Cleared cache for ${binType}`)
		} catch (error) {
			console.error(`❌ Error clearing cache for ${binType}:`, error)
			throw error
		}
	}, [])

	return {
		isLoading,
		error,
		isDataCached,
		downloadAndCacheData,
		loadFromCache,
		ensureDataAvailable,
		ensureDataAvailableAndGetContainers,
		clearCache,
	}
}
