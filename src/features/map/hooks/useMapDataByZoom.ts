import { BinType } from '@/shared/types/bins'
import {
	getDistrictCoordinates,
	getNeighborhoodCoordinates,
	normalizeLocationName,
} from '@/shared/utils/locationsUtils'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useBinsCountStore } from '../stores/binsCountStore'
import { useMapChipsMenuStore } from '../stores/mapChipsMenuStore'
import { useMapDataStore } from '../stores/mapDataStore'
import { useMapViewportStore } from '../stores/mapViewportStore'
import { MapZoomLevels, type MapData, type MapDataItem } from '../types/mapData'
import { hasSignificantMovement } from '../utils/geoUtils'
import { useLocalBinsCache } from './useLocalBinsCache'

// Los tipos MapDataItem y MapData se importan desde '../types/mapData'

// Cache simple en memoria para evitar llamadas repetidas
class MapDataCache {
	private static readonly cache = new Map<
		string,
		{ data: MapDataItem[]; timestamp: number }
	>()
	private static readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

	static get(key: string): MapDataItem[] | null {
		const cached = this.cache.get(key)
		if (!cached) return null

		const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION
		if (isExpired) {
			this.cache.delete(key)
			return null
		}

		return cached.data
	}

	static set(key: string, data: MapDataItem[]): void {
		this.cache.set(key, {
			data,
			timestamp: Date.now(),
		})
	}

	static clear(): void {
		this.cache.clear()
	}
}

// Las funciones de coordenadas ahora se importan desde locationsUtils

export const useMapDataByZoom = () => {
	const { setMapData, mapData } = useMapDataStore()
	const { viewport } = useMapViewportStore()
	const { selectedEndPoint } = useMapChipsMenuStore()
	const { ensureDataAvailable } = useLocalBinsCache()

	// Ref para evitar bucles infinitos
	const lastExecutedRef = useRef<{
		selectedEndPoint: string | null
		zoom: number
		centerLat: number
		centerLng: number
	} | null>(null)

	// Ref para debouncing de contenedores
	const containersDebounceRef = useRef<NodeJS.Timeout | null>(null)
	const isExecutingRef = useRef<boolean>(false)
	const executionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

	const [localMapData, setLocalMapData] = useState<MapData>({
		data: [],
		loading: false,
		error: null,
		type: 'districts',
		endPoint: null,
	})

	// Función para determinar el tipo de datos según el zoom
	const getDataTypeByZoom = (
		zoom: number,
	): 'districts' | 'neighborhoods' | 'containers' => {
		if (zoom < MapZoomLevels.DISTRICT) {
			return 'districts'
		} else if (zoom < MapZoomLevels.CONTAINER) {
			return 'neighborhoods'
		} else {
			return 'containers'
		}
	}

	// Función para verificar si estamos en el mismo rango de zoom
	const isInSameZoomRange = (
		currentZoom: number,
		currentDataType: 'districts' | 'neighborhoods' | 'containers',
	): boolean => {
		const newDataType = getDataTypeByZoom(currentZoom)
		return newDataType === currentDataType
	}

	// Las funciones de Turf.js se usan directamente desde geoUtils.ts

	// Función para obtener datos de distritos
	const fetchDistrictsData = useCallback(
		async (binType: BinType) => {
			const cacheKey = `districts-${binType}`
			const cachedData = MapDataCache.get(cacheKey)

			if (cachedData) {
				console.log('✅ Using cached districts data')
				return cachedData
			}

			console.log('🌐 Fetching districts data from local cache...')

			// Asegurar que los datos estén disponibles en cache local
			await ensureDataAvailable(binType)

			// Obtener datos jerárquicos del store
			const { getHierarchyData } = useBinsCountStore.getState()
			const hierarchyData = getHierarchyData(binType)

			if (!hierarchyData || hierarchyData.length === 0) {
				throw new Error('No hierarchy data available')
			}

			// Agrupar por distrito y sumar conteos
			const districtCounts = new Map<string, number>()
			hierarchyData.forEach(item => {
				const currentCount = districtCounts.get(item.distrito) || 0
				districtCounts.set(item.distrito, currentCount + item.count)
			})

			// Convertir a formato MapDataItem
			const districtsData: MapDataItem[] = Array.from(
				districtCounts.entries(),
			).map(([districtName, count]) => ({
				id: districtName,
				name: districtName,
				count,
				centroid: getDistrictCoordinates(districtName as any) || {
					lat: 40.4168,
					lng: -3.7038,
				},
				type: 'districts' as const,
			}))

			MapDataCache.set(cacheKey, districtsData)
			console.log(`✅ Fetched ${districtsData.length} districts`)
			return districtsData
		},
		[ensureDataAvailable],
	)

	// Función para obtener datos de barrios
	const fetchNeighborhoodsData = useCallback(
		async (binType: BinType, districtName?: string) => {
			const cacheKey = `neighborhoods-${binType}-${districtName || 'all'}`
			const cachedData = MapDataCache.get(cacheKey)

			if (cachedData) {
				console.log('✅ Using cached neighborhoods data')
				return cachedData
			}

			console.log('🌐 Fetching neighborhoods data from local cache...')

			// Asegurar que los datos estén disponibles en cache local
			await ensureDataAvailable(binType)

			// Obtener datos jerárquicos del store
			const { getHierarchyData } = useBinsCountStore.getState()
			const hierarchyData = getHierarchyData(binType)

			if (!hierarchyData || hierarchyData.length === 0) {
				throw new Error('No hierarchy data available')
			}

			// Filtrar por distrito si se especifica
			let filteredData = hierarchyData
			if (districtName) {
				const normalizedDistrictName = normalizeLocationName(districtName)
				filteredData = hierarchyData.filter(
					item =>
						normalizeLocationName(item.distrito) === normalizedDistrictName,
				)
			}

			// Agrupar por barrio y sumar conteos
			const neighborhoodCounts = new Map<string, number>()
			filteredData.forEach(item => {
				const currentCount = neighborhoodCounts.get(item.barrio) || 0
				neighborhoodCounts.set(item.barrio, currentCount + item.count)
			})

			// Convertir a formato MapDataItem
			const neighborhoodsData: MapDataItem[] = Array.from(
				neighborhoodCounts.entries(),
			).map(([neighborhoodName, count]) => ({
				id: neighborhoodName,
				name: neighborhoodName,
				count,
				centroid: getNeighborhoodCoordinates(neighborhoodName as any) || {
					lat: 40.4168,
					lng: -3.7038,
				},
				type: 'neighborhoods' as const,
			}))

			MapDataCache.set(cacheKey, neighborhoodsData)
			console.log(`✅ Fetched ${neighborhoodsData.length} neighborhoods`)
			return neighborhoodsData
		},
		[ensureDataAvailable],
	)

	// Función para obtener datos de contenedores - DESACTIVADA TEMPORALMENTE
	const fetchContainersData = useCallback(
		async (binType: BinType, useCache = true) => {
			console.log('🚫 Containers endpoint temporarily disabled')

			// Retornar array vacío por ahora
			return []
		},
		[],
	)

	// Función helper para ejecutar el fetch
	const executeFetch = useCallback(async () => {
		if (!selectedEndPoint) {
			console.log('🚫 No bin type selected, clearing data')
			setLocalMapData({
				data: [],
				loading: false,
				error: null,
				type: 'districts',
				endPoint: null,
			})
			setMapData({
				type: 'districts',
				data: [],
				loading: false,
				error: null,
				endPoint: null,
			})
			return
		}

		const dataType = getDataTypeByZoom(viewport.zoom)
		console.log(`🗺️ Fetching data for zoom ${viewport.zoom}, type: ${dataType}`)

		// Limpiar datos anteriores inmediatamente para evitar mostrar datos de tipo incorrecto
		setLocalMapData({
			data: [],
			loading: true,
			error: null,
			type: dataType,
			endPoint: selectedEndPoint,
		})
		setMapData({
			type: dataType,
			data: [],
			loading: true,
			error: null,
			endPoint: selectedEndPoint,
		})

		try {
			let data: MapDataItem[] = []

			switch (dataType) {
				case 'districts':
					data = await fetchDistrictsData(selectedEndPoint)
					break
				case 'neighborhoods':
					// Determinar distrito actual basado en bounds del mapa
					// Por ahora, obtener todos los barrios
					data = await fetchNeighborhoodsData(selectedEndPoint)
					break
				case 'containers':
					// Usar coordenadas del centro del viewport
					data = await fetchContainersData(selectedEndPoint)
					break
			}

			setLocalMapData({
				data,
				loading: false,
				error: null,
				type: dataType,
				endPoint: selectedEndPoint,
			})
			setMapData({
				type: dataType,
				data,
				loading: false,
				error: null,
				endPoint: selectedEndPoint,
			})
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Error desconocido'
			console.error('❌ Error fetching map data:', errorMessage)

			setLocalMapData({
				data: [],
				loading: false,
				error: errorMessage,
				type: dataType,
				endPoint: selectedEndPoint,
			})
			setMapData({
				type: dataType,
				data: [],
				loading: false,
				error: errorMessage,
				endPoint: selectedEndPoint,
			})
		}
	}, [
		selectedEndPoint,
		viewport.zoom,
		fetchDistrictsData,
		fetchNeighborhoodsData,
		fetchContainersData,
		setMapData,
	])

	// Función principal para obtener datos según zoom y selección
	const fetchDataByZoom = useCallback(async () => {
		// Si no hay tipo de contenedor seleccionado, no hacer nada
		if (!selectedEndPoint) {
			console.log('🚫 No bin type selected, skipping fetch')
			return
		}

		// Usar el centro almacenado en el viewport store
		const centerLat = viewport.center?.lat || 40.4168
		const centerLng = viewport.center?.lng || -3.7038

		const dataType = getDataTypeByZoom(viewport.zoom)

		// Verificar si ya se ejecutó con los mismos parámetros
		if (lastExecutedRef.current) {
			const isSameZoomRange = isInSameZoomRange(viewport.zoom, mapData.type)

			// Si estamos en el mismo rango de zoom, solo verificar movimiento para contenedores
			if (isSameZoomRange) {
				if (dataType === 'containers') {
					const hasMovement = hasSignificantMovement(
						{
							lat: lastExecutedRef.current.centerLat,
							lng: lastExecutedRef.current.centerLng,
						},
						{ lat: centerLat, lng: centerLng },
						viewport.zoom,
					)

					if (!hasMovement) {
						console.log(
							'🚫 Skipping fetch - same zoom range and no significant movement',
						)
						return
					}
				} else {
					// Para distritos y barrios, si estamos en el mismo rango, no hacer nada
					console.log(
						'🚫 Skipping fetch - same zoom range for districts/neighborhoods',
					)
					return
				}
			}
		}

		// Actualizar referencia de última ejecución
		lastExecutedRef.current = {
			selectedEndPoint,
			zoom: viewport.zoom,
			centerLat,
			centerLng,
		}

		// Implementar debouncing para todos los tipos de datos para evitar transiciones rápidas
		if (containersDebounceRef.current) {
			clearTimeout(containersDebounceRef.current)
		}

		return new Promise<void>(resolve => {
			containersDebounceRef.current = setTimeout(async () => {
				// Verificar si ya se está ejecutando solo al momento de ejecutar
				if (isExecutingRef.current) {
					console.log(
						'🚫 Fetch already executing, skipping debounced execution...',
					)
					resolve()
					return
				}

				isExecutingRef.current = true

				// Timeout de seguridad para liberar el bloqueo (10 segundos)
				executionTimeoutRef.current = setTimeout(() => {
					if (isExecutingRef.current) {
						console.warn('⚠️ Execution timeout - releasing lock')
						isExecutingRef.current = false
					}
				}, 10000)

				try {
					console.log(`🔄 Executing debounced fetch for ${dataType}...`)
					await executeFetch()
				} catch (error) {
					console.error('❌ Error in debounced fetch:', error)
				} finally {
					// Limpiar timeout y liberar bloqueo
					if (executionTimeoutRef.current) {
						clearTimeout(executionTimeoutRef.current)
						executionTimeoutRef.current = null
					}
					isExecutingRef.current = false
					resolve()
				}
			}, 500) // Aumentado a 500ms para mejor estabilidad
		})
	}, [
		selectedEndPoint,
		viewport.zoom,
		viewport.center,
		mapData.type,
		executeFetch,
		isInSameZoomRange,
		hasSignificantMovement,
	])

	// Efecto para cargar datos cuando cambien los parámetros
	useEffect(() => {
		// Solo ejecutar si hay un tipo de contenedor seleccionado
		if (selectedEndPoint) {
			// Usar un timeout para evitar ejecuciones excesivas
			const timeoutId = setTimeout(() => {
				fetchDataByZoom()
			}, 100) // Pequeño delay para evitar ejecuciones excesivas

			return () => clearTimeout(timeoutId)
		}
	}, [selectedEndPoint, viewport.zoom])

	return {
		mapData: localMapData,
		refetch: fetchDataByZoom,
		clearCache: MapDataCache.clear,
	}
}
