import { BinType } from '@/shared/types/bins'
import { useCallback, useEffect, useMemo, useState } from 'react'
import useSupercluster from 'use-supercluster'
import {
	CLUSTER_MAX_ZOOM,
	CLUSTER_RADIUS,
	CLUSTER_USE_UNTIL_ZOOM,
	DEFAULT_ZOOM_FALLBACK,
	MIN_CLUSTER_SIZE,
	SUPERCLUSTER_EXTENT,
	SUPERCLUSTER_NODE_SIZE,
	ZOOM_THROTTLE_MS,
} from '../constants/clustering'
import {
	clearBinsCache,
	filterPointsAsync,
	loadContainersWithTimeout,
	type BinsCache,
} from '../services/binsLoader'
import { useMapChipsMenuStore } from '../stores/mapChipsMenuStore'
import { useMapViewportStore } from '../stores/mapViewportStore'
import { useSuperclusterCacheStore } from '../stores/superclusterCacheStore'
import { BinPoint, MapZoomLevels, type LngLatBounds } from '../types/mapData'
import { useLocalBinsCache } from './useLocalBinsCache'

// Re-exportar BinPoint para compatibilidad
export type { BinPoint }

// Configuración simplificada - solo supercluster para todo

const areBoundsEqual = (a: LngLatBounds, b: LngLatBounds, epsilon = 1e-6) => {
	const [aSW, aNE] = a
	const [bSW, bNE] = b
	return (
		Math.abs(aSW[0] - bSW[0]) < epsilon && // lng
		Math.abs(aSW[1] - bSW[1]) < epsilon && // lat
		Math.abs(aNE[0] - bNE[0]) < epsilon && // lng
		Math.abs(aNE[1] - bNE[1]) < epsilon // lat
	)
}

export const useSuperclusterBins = () => {
	const { viewport } = useMapViewportStore()
	const { selectedEndPoint } = useMapChipsMenuStore()
	const { setPointsCache, getPointsCache, clearPointsCache, setClustersCache } =
		useSuperclusterCacheStore()

	// Obtener ensureDataAvailable para coordinar con MapChipsContainer
	const { ensureDataAvailable } = useLocalBinsCache()

	// Crear el objeto cache para el servicio
	const binsCache: BinsCache = useMemo(
		() => ({
			get: getPointsCache,
			set: setPointsCache,
			clear: clearPointsCache,
		}),
		[getPointsCache, setPointsCache, clearPointsCache],
	)

	// Obtener puntos según el tipo seleccionado
	const [points, setPoints] = useState<BinPoint[]>([])
	const [isLoadingPoints, setIsLoadingPoints] = useState(false)
	const [isRecalculatingClusters, setIsRecalculatingClusters] = useState(false)
	const [isDataCached, setIsDataCached] = useState(false)

	useEffect(() => {
		let isMounted = true
		let timeoutId: NodeJS.Timeout | null = null

		const loadPoints = async () => {
			if (!selectedEndPoint) {
				if (isMounted) {
					setPoints([])
					setIsLoadingPoints(false)
					setIsDataCached(false)
				}
				return
			}

			// Timeout de seguridad para evitar bloqueos indefinidos
			timeoutId = setTimeout(() => {
				if (isMounted) {
					console.warn('⚠️ Timeout: Load points taking too long, aborting')
					setIsLoadingPoints(false)
				}
			}, 10000) // 10 segundos timeout

			const startTime = performance.now()
			setIsLoadingPoints(true)

			try {
				// Usar ensureDataAvailable para coordinar con MapChipsContainer
				await ensureDataAvailable(selectedEndPoint)

				const calculatedPoints = await loadContainersWithTimeout(
					selectedEndPoint,
					binsCache,
				)
				if (isMounted) {
					setPoints(calculatedPoints)
					setIsDataCached(true)
					const totalTime = performance.now() - startTime
					console.log(`✅ Points loaded in ${totalTime.toFixed(2)}ms`)
				}
			} catch (error) {
				console.error('❌ Error loading points:', error)
				if (isMounted) {
					setPoints([])
					setIsDataCached(false)
				}
			} finally {
				if (timeoutId) {
					clearTimeout(timeoutId)
					timeoutId = null
				}
				if (isMounted) {
					setIsLoadingPoints(false)
				}
			}
		}

		loadPoints()

		return () => {
			isMounted = false
			if (timeoutId) {
				clearTimeout(timeoutId)
			}
		}
	}, [selectedEndPoint])

	const superclusterOptions = useMemo(
		() => ({
			radius: CLUSTER_RADIUS,
			maxZoom: CLUSTER_MAX_ZOOM,
			minZoom: 0,
			extent: SUPERCLUSTER_EXTENT,
			nodeSize: SUPERCLUSTER_NODE_SIZE,
			// Opciones para clustering por tipo
			map: (props: { binType: BinType }) => ({
				binType: props.binType,
				count: 1,
			}),
			reduce: (
				acc: { count: number; binType?: BinType },
				props: { binType: BinType },
			) => {
				acc.count += 1
				// Mantener el tipo de contenedor del cluster
				if (!acc.binType) {
					acc.binType = props.binType
				}
				return acc
			},
		}),
		[],
	)

	// Throttling para zoom en supercluster - muy agresivo
	const [throttledZoom, setThrottledZoom] = useState(viewport.zoom)
	const [isDebouncing, setIsDebouncing] = useState(false)

	useEffect(() => {
		const currentZoom = viewport.zoom ?? MapZoomLevels.DISTRICT

		if (currentZoom <= MapZoomLevels.CLUSTER) {
			setThrottledZoom(currentZoom)
			setIsRecalculatingClusters(false)
			setIsDebouncing(false)
			return
		}

		setIsDebouncing(true)
		setIsRecalculatingClusters(true)
		const timeoutId = setTimeout(() => {
			setThrottledZoom(currentZoom)
			setIsRecalculatingClusters(false)
			setIsDebouncing(false)
		}, ZOOM_THROTTLE_MS)

		return () => {
			clearTimeout(timeoutId)
			setIsDebouncing(false)
		}
	}, [viewport.zoom])

	// Validar datos antes de usar supercluster
	const validPoints = points || []
	const validBounds: LngLatBounds | null = viewport.bounds
	const validZoom =
		typeof throttledZoom === 'number' ? throttledZoom : DEFAULT_ZOOM_FALLBACK

	// Filtrar puntos usando pipeline asíncrono
	const [filteredPoints, setFilteredPoints] = useState<BinPoint[]>([])

	// STEP 2: Filtrar puntos con debounce adaptativo
	useEffect(() => {
		// Solo filtrar si hay chip seleccionado Y puntos válidos
		if (!selectedEndPoint) {
			setFilteredPoints([])
			return
		}

		if (validPoints.length === 0) {
			setFilteredPoints([])
			return
		}

		// Debounce más corto para zoom out (más reactivo)
		const currentZoom = viewport.zoom ?? MapZoomLevels.DISTRICT
		const previousZoom = throttledZoom
		const isZoomingOut = currentZoom < previousZoom
		
		// Debounce más corto para zoom out (50ms vs 150ms)
		const debounceTime = isZoomingOut ? 50 : 150

		const filterTimeoutId = setTimeout(async () => {
			try {
				if (__DEV__) {
					console.log(
						`🔍 Step 2 - Starting filtering with stable bounds:`,
						viewport.bounds,
					)
				}

				const zoom = viewport.zoom ?? MapZoomLevels.DISTRICT
				const filtered = await filterPointsAsync(
					validPoints,
					zoom,
					viewport.bounds,
					viewport.center,
				)
				setFilteredPoints(filtered)

				if (__DEV__) {
					console.log(
						`🔍 Step 2 - Filtering completed: ${validPoints.length} → ${filtered.length} points`,
					)
				}
			} catch (error) {
				console.error(`❌ Error filtering points:`, error)
				setFilteredPoints([])
			}
		}, debounceTime)

		return () => {
			clearTimeout(filterTimeoutId)
		}
	}, [
		selectedEndPoint,
		validPoints,
		viewport.zoom,
		viewport.bounds,
		viewport.center,
		throttledZoom,
	])

	// Debug: Log del filtrado de puntos (optimizado)
	useEffect(() => {
		if (selectedEndPoint && filteredPoints.length > 0 && __DEV__) {
			// Solo logear cuando hay cambios significativos en el número de puntos
			const currentZoomLevel = Math.floor(viewport.zoom ?? 0)
			const lastLoggedKey = `${selectedEndPoint}-${currentZoomLevel}-${filteredPoints.length}`

			if (lastLoggedKey !== (window as any).__lastLoggedFilterKey) {
				console.log(
					`🔍 Viewport filtering: ${validPoints.length} total → ${filteredPoints.length} visible (zoom: ${viewport.zoom})`,
				)
				;(window as any).__lastLoggedFilterKey = lastLoggedKey
			}
		}
	}, [
		filteredPoints.length,
		validPoints.length,
		viewport.zoom,
		selectedEndPoint,
	])

	// Hook de supercluster - siempre activo hasta zoom alto
	const currentZoom = viewport.zoom ?? MapZoomLevels.DISTRICT
	const shouldUseSupercluster = currentZoom <= CLUSTER_USE_UNTIL_ZOOM

	// Usar supercluster para todos los zoom levels
	const { clusters, supercluster } = useSupercluster({
		points: filteredPoints,
		bounds: validBounds
			? [
					validBounds[0][0],
					validBounds[0][1],
					validBounds[1][0],
					validBounds[1][1],
				]
			: undefined,
		zoom: currentZoom, // Usar el mismo zoom que filteredPoints
		options: superclusterOptions,
	})

	// Cache de clusters y log de debug
	useEffect(() => {
		if (selectedEndPoint && clusters.length > 0) {
			// Guardar clusters en cache (convertir a BinPoint[])
			const binPointClusters = clusters.map(cluster => ({
				...cluster,
				geometry: {
					...cluster.geometry,
					coordinates: cluster.geometry.coordinates as [number, number],
				},
			})) as BinPoint[]
			setClustersCache(selectedEndPoint, validZoom, binPointClusters)
		}

		// Solo mostrar logs cuando hay un chip seleccionado
		if (selectedEndPoint) {
			console.log(
				`🔍 Supercluster: ${filteredPoints.length} points → ${clusters.length} clusters (zoom: ${currentZoom})`,
			)
		}
	}, [
		filteredPoints.length,
		clusters.length,
		currentZoom,
		selectedEndPoint,
		setClustersCache,
	])

	// Función para obtener clusters hijos
	const getClusterChildren = useCallback(
		(clusterId: number) => {
			if (!supercluster) return []
			return supercluster.getChildren(clusterId)
		},
		[supercluster],
	)

	// Función para obtener cluster expandido
	const getClusterExpansionZoom = useCallback(
		(clusterId: number) => {
			if (!supercluster) return viewport.zoom
			return supercluster.getClusterExpansionZoom(clusterId)
		},
		[supercluster, viewport.zoom],
	)

	// Función auxiliar para expandir un cluster
	const expandCluster = useCallback(
		(feature: any, supercluster: any): BinPoint[] => {
			if (typeof feature.id !== 'number') return []

			try {
				const leaves = supercluster.getLeaves(
					feature.id,
					feature.properties.point_count ?? 0,
					0,
				)
				return leaves.map((leaf: any) => ({
					...(leaf as BinPoint),
					geometry: {
						...leaf.geometry,
						coordinates: leaf.geometry.coordinates as [number, number],
					},
				}))
			} catch (error) {
				console.warn('⚠️ Error expanding cluster leaves', feature.id, error)
				return []
			}
		},
		[],
	)

	// Función auxiliar para determinar si un cluster debe expandirse
	const shouldExpandCluster = useCallback(
		(feature: any): boolean => {
			const count = feature.properties.point_count ?? 0
			const currentZoom = viewport.zoom ?? MapZoomLevels.DISTRICT
			return (
				count > 0 &&
				(count <= MIN_CLUSTER_SIZE || currentZoom >= MapZoomLevels.CLUSTER)
			)
		},
		[viewport.zoom],
	)

	const displayClusters = useMemo(() => {
		// Si no debemos usar supercluster, devolver puntos individuales
		if (!shouldUseSupercluster) {
			return filteredPoints.filter(point => !point.properties.cluster)
		}

		// Si no hay datos cargados, devolver array vacío
		if (filteredPoints.length === 0) {
			return []
		}

		if (!supercluster) {
			return clusters
		}

		const resolved: BinPoint[] = []

		for (const feature of clusters) {
			if (feature.properties?.cluster && shouldExpandCluster(feature)) {
				const expandedLeaves = expandCluster(feature, supercluster)
				resolved.push(...expandedLeaves)
			} else {
				resolved.push({
					...(feature as BinPoint),
					geometry: {
						...feature.geometry,
						coordinates: feature.geometry.coordinates as [number, number],
					},
				})
			}
		}

		return resolved
	}, [
		clusters,
		filteredPoints,
		isDataCached,
		shouldUseSupercluster,
		supercluster,
		shouldExpandCluster,
		expandCluster,
	])

	// Limpiar cache cuando se desactiva el chip
	useEffect(() => {
		if (!selectedEndPoint) {
			clearBinsCache(binsCache)
		}
	}, [selectedEndPoint, binsCache])

	return {
		clusters: displayClusters,
		supercluster,
		points,
		getClusterChildren,
		getClusterExpansionZoom,
		isLoading:
			isLoadingPoints ||
			isRecalculatingClusters ||
			isDebouncing ||
			!selectedEndPoint,
		selectedBinType: selectedEndPoint,
		isUsingIndividualContainers: !shouldUseSupercluster,
		shouldUseSupercluster,
	}
}
