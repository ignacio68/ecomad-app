import { BinType } from '@/shared/types/bins'
import {
	CLUSTER_MAX_ZOOM,
	CLUSTER_MIN_ZOOM,
	CLUSTER_RADIUS,
	CLUSTER_USE_UNTIL_ZOOM,
	MIN_CLUSTER_SIZE,
	SUPERCLUSTER_EXTENT,
	SUPERCLUSTER_NODE_SIZE,
	ZOOM_THROTTLE_MS,
} from '@map/constants/clustering'
import { INITIAL_BOUNDS } from '@map/constants/map'
import { ensureDataAvailable } from '@map/services/binsCacheService'
import {
	clearBinsCache,
	filterPointsForViewport,
	loadContainersAsGeoJSON,
	type BinsCache,
} from '@map/services/binsLoader'
import { useMapChipsMenuStore } from '@map/stores/mapChipsMenuStore'
import { useMapNavigationStore } from '@map/stores/mapNavigationStore'
import { useMapViewportStore } from '@map/stores/mapViewportStore'
import { useSuperclusterCacheStore } from '@map/stores/superclusterCacheStore'
import { BinPoint, MapZoomLevels } from '@map/types/mapData'
import { area } from '@turf/area'
import { bboxPolygon } from '@turf/turf'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useSupercluster from 'use-supercluster'

export const getClusterChildren = (supercluster: any, clusterId: number) => {
	if (!supercluster) return []
	return supercluster.getChildren(clusterId)
}

export const getClusterExpansionZoom = (
	supercluster: any,
	clusterId: number,
	fallbackZoom = MapZoomLevels.DISTRICT,
) => {
	if (!supercluster) return fallbackZoom
	return supercluster.getClusterExpansionZoom(clusterId)
}

const expandCluster = (feature: any, supercluster: any): BinPoint[] => {
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
}

export const useSuperclusterBins = () => {
	const { viewport, isProgrammaticMove } = useMapViewportStore()
	const { selectedEndPoint } = useMapChipsMenuStore()
	const { route } = useMapNavigationStore()
	const { setPointsCache, getPointsCache, clearPointsCache, setClustersCache } =
		useSuperclusterCacheStore()

	// Zustand provee funciones estables, no necesita memoización
	const binsCache: BinsCache = {
		get: getPointsCache,
		set: setPointsCache,
		clear: clearPointsCache,
	}

	const [points, setPoints] = useState<BinPoint[]>([])
	const [isLoadingPoints, setIsLoadingPoints] = useState(false)
	const [isRecalculatingClusters, setIsRecalculatingClusters] = useState(false)

	// ✅ OPTIMIZACIÓN: Early return si no hay endpoint seleccionado
	// Evita todos los cálculos innecesarios al inicio
	const hasNoData = !selectedEndPoint && points.length === 0

	// ✅ OPTIMIZACIÓN: Ref para detectar primera carga de datos
	const previousPointsLengthRef = useRef(0)

	// ✅ OPTIMIZACIÓN: Ref para guardar el timeout actual y poder cancelarlo
	const filterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	// ✅ OPTIMIZACIÓN: Ref para detectar cuándo fue el último movimiento programático
	const lastProgrammaticMoveRef = useRef<number>(0)

	// ✅ OPTIMIZACIÓN: Ref para guardar bounds anteriores y zoom
	const previousBoundsRef = useRef<typeof stableBounds | null>(null)
	const previousZoomRef = useRef<number | null>(null)

	useEffect(() => {
		let isMounted = true

		const loadPoints = async () => {
			if (!selectedEndPoint) {
				setPoints([])
				setIsLoadingPoints(false)
				clearBinsCache(binsCache)
				previousPointsLengthRef.current = 0
				return
			}

			setIsLoadingPoints(true)

			try {
				await ensureDataAvailable(selectedEndPoint)

				const calculatedPoints = await loadContainersAsGeoJSON(
					selectedEndPoint,
					binsCache,
				)
				if (isMounted) {
					setPoints(calculatedPoints)
				}
			} catch (error) {
				console.error('❌ Error loading points:', error)
				if (isMounted) {
					setPoints([])
				}
			} finally {
				if (isMounted) {
					setIsLoadingPoints(false)
				}
			}
		}

		loadPoints()

		return () => {
			isMounted = false
		}
	}, [selectedEndPoint])

	const superclusterOptions = useMemo(
		() => ({
			radius: CLUSTER_RADIUS,
			maxZoom: CLUSTER_MAX_ZOOM,
			minZoom: CLUSTER_MIN_ZOOM,
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

	const [throttledZoom, setThrottledZoom] = useState(viewport.zoom)
	const [isDebouncing, setIsDebouncing] = useState(false)

	useEffect(() => {
		const currentZoom = viewport.zoom ?? MapZoomLevels.DISTRICT
		const previousZoom = throttledZoom
		const isZoomingOut = currentZoom < previousZoom
		const shouldSkipThrottling =
			isZoomingOut || currentZoom <= MapZoomLevels.CLUSTER

		if (shouldSkipThrottling) {
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
	}, [viewport.zoom, throttledZoom])

	const [filteredPoints, setFilteredPoints] = useState<BinPoint[]>([])

	const stableBounds = useMemo(
		() => viewport.bounds,
		[
			viewport.bounds?.[0]?.[0],
			viewport.bounds?.[0]?.[1],
			viewport.bounds?.[1]?.[0],
			viewport.bounds?.[1]?.[1],
		],
	)

	const stableCenter = useMemo(
		() => viewport.center,
		[viewport.center?.lat, viewport.center?.lng],
	)

	useEffect(() => {
		// ✅ OPTIMIZACIÓN: Early return sin logs si no hay datos
		if (!selectedEndPoint || points.length === 0) {
			setFilteredPoints([])
			// Cancelar timeout pendiente si lo hay
			if (filterTimeoutRef.current) {
				clearTimeout(filterTimeoutRef.current)
				filterTimeoutRef.current = null
			}
			return
		}

		const effectStartTime = performance.now()
		console.log('⏱️ [TIMING] Filter useEffect triggered')

		// ✅ OPTIMIZACIÓN: Cancelar timeout anterior si existe
		if (filterTimeoutRef.current) {
			clearTimeout(filterTimeoutRef.current)
			console.log('⏱️ [TIMING] Cancelled previous filter timeout')
		}

		// ✅ Detectar si es primera carga (pasamos de 0 a muchos puntos)
		const isFirstLoad =
			previousPointsLengthRef.current === 0 && points.length > 0
		previousPointsLengthRef.current = points.length

		// ✅ OPTIMIZACIÓN: Detectar si bounds/zoom cambiaron significativamente
		const currentZoom = viewport.zoom ?? 11
		const zoomChanged = previousZoomRef.current !== currentZoom

		// ✅ Detectar si acabamos de tener un movimiento programático
		const timeSinceLastProgrammaticMove =
			Date.now() - lastProgrammaticMoveRef.current
		const IGNORE_BOUNDS_AFTER_PROGRAMMATIC_MS = 1500 // 1.5 segundos
		const isJustAfterProgrammaticMove =
			timeSinceLastProgrammaticMove < IGNORE_BOUNDS_AFTER_PROGRAMMATIC_MS &&
			!isProgrammaticMove

		// ✅ OPTIMIZACIÓN: HARD STOP - Ignorar cambios de bounds justo después de programático
		// Durante 1.5s después de animación, SOLO filtrar si el zoom cambió
		if (isJustAfterProgrammaticMove && !zoomChanged) {
			console.log(
				'⏱️ [TIMING] HARD STOP - Ignoring bounds changes after programmatic move',
				{
					timeSince: timeSinceLastProgrammaticMove + 'ms',
				},
			)
			return
		}

		// Comparar bounds usando Turf para calcular diferencia de área
		let boundsChangedSignificantly = true

		if (previousBoundsRef.current && stableBounds) {
			const prevBounds = previousBoundsRef.current
			const currBounds = stableBounds

			try {
				// Crear polígonos de los bounds
				const prevPoly = bboxPolygon([
					prevBounds[0][0],
					prevBounds[0][1],
					prevBounds[1][0],
					prevBounds[1][1],
				])
				const currPoly = bboxPolygon([
					currBounds[0][0],
					currBounds[0][1],
					currBounds[1][0],
					currBounds[1][1],
				])

				// Calcular áreas
				const prevArea = area(prevPoly)
				const currArea = area(currPoly)

				// Calcular diferencia porcentual
				const areaDiffPercent = (Math.abs(currArea - prevArea) / prevArea) * 100

				// Si la diferencia es < 5%, considerar sin cambio significativo
				boundsChangedSignificantly = areaDiffPercent > 5

				console.log('⏱️ [TIMING] Bounds comparison:', {
					prevArea: prevArea.toFixed(0) + 'm²',
					currArea: currArea.toFixed(0) + 'm²',
					diffPercent: areaDiffPercent.toFixed(2) + '%',
					significant: boundsChangedSignificantly,
				})
			} catch (error) {
				// Si hay error en el cálculo, asumir que sí cambió
				console.warn('⚠️ [TIMING] Error comparing bounds:', error)
				boundsChangedSignificantly = true
			}
		}

		// Si no hay cambios significativos y no es programático ni primera carga, skip
		if (
			!boundsChangedSignificantly &&
			!zoomChanged &&
			!isProgrammaticMove &&
			!isFirstLoad
		) {
			console.log('⏱️ [TIMING] No significant changes, skipping filter')
			return
		}

		previousBoundsRef.current = stableBounds
		previousZoomRef.current = currentZoom

		// ✅ Actualizar timestamp si es movimiento programático
		if (isProgrammaticMove) {
			lastProgrammaticMoveRef.current = Date.now()
		}

		// ✅ Si es movimiento programático, filtrar INMEDIATAMENTE (sin delay)
		// Si es primera carga de datos, filtrar INMEDIATAMENTE para mejor UX
		// Si acabamos de tener movimiento programático, usar delay alto para debounce
		// Si hay ruta activa, usar delay mínimo para mejor fluidez
		// Si es movimiento manual, usar delay de 50ms para performance
		let delay = 50 // Default para movimiento manual
		if (isProgrammaticMove) {
			delay = 0
		} else if (isFirstLoad) {
			delay = 0 // ✅ OPTIMIZACIÓN: Carga inicial sin delay
		} else if (isJustAfterProgrammaticMove) {
			delay = 300 // ✅ OPTIMIZACIÓN: Delay alto después de animación para debounce
		} else if (route) {
			delay = 5 // Reducido a 5ms para máxima fluidez
		}

		const filterTimeoutId = setTimeout(() => {
			console.log('⏱️ [TIMING] Filter timeout executed after:', {
				delay: delay + 'ms',
				actualDelay: (performance.now() - effectStartTime).toFixed(2) + 'ms',
			})

			try {
				const validBounds = stableBounds ?? INITIAL_BOUNDS
				const realZoom = viewport.zoom ?? MapZoomLevels.DISTRICT

				console.log('🔍 [FILTER] Starting filter process:', {
					pointsCount: points.length,
					realZoom,
					throttledZoom,
					isProgrammaticMove,
					delay,
					hasBounds: !!stableBounds,
					bounds: stableBounds
						? `${stableBounds[0]} to ${stableBounds[1]}`
						: 'INITIAL_BOUNDS',
					hasCenter: !!stableCenter,
					center: stableCenter
						? `${stableCenter.lat}, ${stableCenter.lng}`
						: 'null',
				})

				// Usar viewport.zoom REAL en lugar de throttledZoom para filtrado
				// para evitar que muestre contenedores incorrectos en Android
				const filtered = filterPointsForViewport(
					points,
					realZoom,
					validBounds,
					stableCenter,
					route,
				)

				console.log('🔍 [FILTER] Filter result:', {
					inputPoints: points.length,
					outputPoints: filtered.length,
					realZoom,
					filteredRatio:
						((filtered.length / points.length) * 100).toFixed(1) + '%',
				})

				setFilteredPoints(filtered)

				// ✅ OPTIMIZACIÓN: Si acabamos de filtrar después de movimiento programático,
				// resetear el timestamp para evitar más cálculos innecesarios
				if (isJustAfterProgrammaticMove) {
					lastProgrammaticMoveRef.current = 0
					console.log(
						'⏱️ [TIMING] Reset programmatic move timestamp after successful filter',
					)
				}
			} catch (error) {
				console.error(`❌ [FILTER] Error filtering points:`, error)
				setFilteredPoints([])
			} finally {
				// ✅ Limpiar ref después de ejecutar
				filterTimeoutRef.current = null
			}
		}, delay)

		// ✅ Guardar timeout en ref
		filterTimeoutRef.current = filterTimeoutId

		return () => {
			clearTimeout(filterTimeoutId)
			filterTimeoutRef.current = null
		}
	}, [
		selectedEndPoint,
		points,
		viewport.zoom,
		stableBounds,
		stableCenter,
		isProgrammaticMove,
		route,
	])

	// Usar realZoom para la decisión de clustering, no throttledZoom
	// para evitar desfases que causan que se muestren clusters cuando deberían ser puntos individuales
	const realZoom = viewport.zoom ?? MapZoomLevels.DISTRICT
	const shouldUseSupercluster = realZoom <= CLUSTER_USE_UNTIL_ZOOM

	// Log solo cuando cambia la decisión de clustering
	useEffect(() => {
		console.log('🔍 [SUPERCLUSTER] Clustering decision changed:', {
			realZoom,
			throttledZoom,
			CLUSTER_USE_UNTIL_ZOOM,
			shouldUseSupercluster,
		})
	}, [realZoom, throttledZoom, shouldUseSupercluster])

	const { clusters, supercluster } = useSupercluster({
		points: filteredPoints,
		bounds: stableBounds
			? [
					stableBounds[0][0],
					stableBounds[0][1],
					stableBounds[1][0],
					stableBounds[1][1],
				]
			: undefined,
		zoom: throttledZoom,
		options: superclusterOptions,
	})

	useEffect(() => {
		if (selectedEndPoint && clusters.length > 0) {
			const binPointClusters = clusters.map(cluster => ({
				...cluster,
				geometry: {
					...cluster.geometry,
					coordinates: cluster.geometry.coordinates as [number, number],
				},
			})) as BinPoint[]
			setClustersCache(selectedEndPoint, throttledZoom, binPointClusters)
		}
	}, [selectedEndPoint, clusters, throttledZoom, setClustersCache])

	const shouldExpandCluster = useCallback(
		(feature: any): boolean => {
			const count = feature.properties.point_count ?? 0
			return (
				count > 0 &&
				(count <= MIN_CLUSTER_SIZE || throttledZoom >= MapZoomLevels.CLUSTER)
			)
		},
		[throttledZoom],
	)

	const displayClusters = useMemo(() => {
		if (hasNoData) {
			return []
		}

		if (clusters.length === 0 && filteredPoints.length === 0) {
			return []
		}
		if (shouldUseSupercluster && clusters.length === 0) {
			return []
		}

		const memoStartTime = performance.now()
		console.log('⏱️ [TIMING] displayClusters useMemo START', {
			shouldUseSupercluster,
			filteredPointsCount: filteredPoints.length,
			clustersCount: clusters.length,
			isProgrammaticMove,
		})

		let result: BinPoint[]

		if (
			!shouldUseSupercluster &&
			isProgrammaticMove &&
			filteredPoints.length > 500
		) {
			console.log(
				'⏱️ [TIMING] displayClusters WAITING for correct filtering (avoiding 800+ markers render)',
			)
			return []
		}

		if (!shouldUseSupercluster) {
			result = filteredPoints.filter(point => !point.properties.cluster)
			console.log(
				'⏱️ [TIMING] displayClusters useMemo END (individual points):',
				{
					elapsed: (performance.now() - memoStartTime).toFixed(2) + 'ms',
					resultCount: result.length,
				},
			)
			return result
		}

		if (clusters.length === 0) {
			console.log('⏱️ [TIMING] displayClusters useMemo END (no clusters):', {
				elapsed: (performance.now() - memoStartTime).toFixed(2) + 'ms',
			})
			return []
		}

		if (!supercluster) {
			console.log(
				'⏱️ [TIMING] displayClusters useMemo END (no supercluster):',
				{
					elapsed: (performance.now() - memoStartTime).toFixed(2) + 'ms',
				},
			)
			return clusters
		}

		const resolved: BinPoint[] = []
		let expandedCount = 0
		let clusterCount = 0

		for (const feature of clusters) {
			if (feature.properties?.cluster && shouldExpandCluster(feature)) {
				const expandedLeaves = expandCluster(feature, supercluster)
				resolved.push(...expandedLeaves)
				expandedCount += expandedLeaves.length
			} else {
				resolved.push(feature as BinPoint)
				clusterCount += 1
			}
		}

		console.log('⏱️ [TIMING] displayClusters useMemo END (with expansion):', {
			elapsed: (performance.now() - memoStartTime).toFixed(2) + 'ms',
			resultCount: resolved.length,
			expandedCount,
			clusterCount,
		})

		return resolved
	}, [
		clusters,
		shouldUseSupercluster,
		filteredPoints,
		supercluster,
		shouldExpandCluster,
		throttledZoom,
		isProgrammaticMove,
		hasNoData,
	])

	useEffect(() => {
		if (hasNoData) return

		console.log('🎨 [RENDER] Clusters to render changed:', {
			count: displayClusters.length,
			shouldUseSupercluster,
			filteredPointsCount: filteredPoints.length,
			realZoom,
			throttledZoom,
		})
	}, [
		displayClusters.length,
		shouldUseSupercluster,
		filteredPoints.length,
		realZoom,
		throttledZoom,
		hasNoData,
	])

	if (hasNoData) {
		return {
			clusters: [],
			supercluster: null,
			points: [],
			isLoading: false,
			selectedBinType: null,
			isUsingIndividualContainers: false,
			shouldUseSupercluster: true,
		}
	}

	return {
		clusters: displayClusters,
		supercluster,
		points,
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
