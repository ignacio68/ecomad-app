import { BinType } from '@/shared/types/bins'
import {
	BOUNDS_AREA_CHANGE_PERCENT,
	BOUNDS_CHANGE_DELAY_MS,
	CLUSTER_MAX_ZOOM,
	CLUSTER_MIN_ZOOM,
	CLUSTER_RADIUS,
	CLUSTER_USE_UNTIL_ZOOM,
	MIN_CLUSTER_SIZE,
	SUPERCLUSTER_EXTENT,
	SUPERCLUSTER_NODE_SIZE,
	ZOOM_CHANGE_DELAY_MS,
	ZOOM_NO_BOUNDS_RECALC,
	ZOOM_RECALC_THRESHOLD,
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
import { getCurrentBoundsArea } from '@map/utils/geoUtils'
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

	// ✅ Early return si no hay endpoint seleccionado
	const hasNoData = !selectedEndPoint && points.length === 0

	// ✅ Refs para detectar cambios significativos (SIMPLIFICADOS)
	const previousZoomRef = useRef<number | null>(null)
	const previousBoundsAreaRef = useRef<number | null>(null)

	const setBinData = (
		calculatedPoints: BinPoint[] | [],
		isLoadingPoints: boolean,
	) => {
		setPoints(calculatedPoints)
		setIsLoadingPoints(isLoadingPoints)
	}

	useEffect(() => {
		let isMounted = true

		const loadPoints = async () => {
			if (!selectedEndPoint) {
				setBinData([], false)
				clearBinsCache(binsCache)
				return
			}

			setIsLoadingPoints(true)

			try {
				await ensureDataAvailable(selectedEndPoint)
				if (!isMounted) return

				const calculatedPoints = await loadContainersAsGeoJSON(
					selectedEndPoint,
					binsCache,
				)
				if (!isMounted) return

				setBinData(calculatedPoints, false)
			} catch (error) {
				console.error('❌ Error loading points:', error)
				if (!isMounted) return
				setBinData([], false)
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

	// ✅ Refs para estabilizar useSupercluster (solo actualizar cuando filtramos)
	const superclusterBoundsRef = useRef(stableBounds)
	const superclusterZoomRef = useRef(viewport.zoom ?? MapZoomLevels.DISTRICT)

	useEffect(() => {
		if (!selectedEndPoint || points.length === 0) {
			setFilteredPoints([])
			return
		}

		const currentZoom = viewport.zoom ?? MapZoomLevels.DISTRICT
		const currentBounds = stableBounds ?? INITIAL_BOUNDS

		const isFirstLoad = previousZoomRef.current === null

		const zoomDiff =
			previousZoomRef.current !== null
				? currentZoom - previousZoomRef.current
				: 0
		const zoomChangedSignificantly = Math.abs(zoomDiff) >= ZOOM_RECALC_THRESHOLD

		let currentBoundsArea = 0
		let boundsAreaChangedSignificantly = false

		try {
			currentBoundsArea = getCurrentBoundsArea(currentBounds)

			if (previousBoundsAreaRef.current !== null) {
				const areaDiffPercent =
					(Math.abs(currentBoundsArea - previousBoundsAreaRef.current) /
						previousBoundsAreaRef.current) *
					100
				boundsAreaChangedSignificantly =
					areaDiffPercent > BOUNDS_AREA_CHANGE_PERCENT

				console.log('📐 [BOUNDS] Area comparison:', {
					prevArea: previousBoundsAreaRef.current.toFixed(0) + 'm²',
					currArea: currentBoundsArea.toFixed(0) + 'm²',
					diffPercent: areaDiffPercent.toFixed(1) + '%',
					significant: boundsAreaChangedSignificantly,
				})
			}
		} catch (error) {
			console.warn('⚠️ Error calculating bounds area:', error)
			boundsAreaChangedSignificantly = true
		}

		// Early return: Sin cambios significativos
		if (
			!isFirstLoad &&
			!zoomChangedSignificantly &&
			!boundsAreaChangedSignificantly
		) {
			console.log('✅ [FILTER] No changes, skipping')
			return
		}

		// Early return: Zoom bajo + solo bounds cambiaron
		if (
			boundsAreaChangedSignificantly &&
			!zoomChangedSignificantly &&
			currentZoom < ZOOM_NO_BOUNDS_RECALC
		) {
			console.log('🚫 [FILTER] Zoom bajo, ignorando bounds', {
				zoom: currentZoom,
				threshold: ZOOM_NO_BOUNDS_RECALC,
			})
			return
		}

		// Determinar delay: 0ms para zoom/primera carga, 50ms para bounds
		const delay =
			isFirstLoad || zoomChangedSignificantly
				? ZOOM_CHANGE_DELAY_MS
				: BOUNDS_CHANGE_DELAY_MS

		// Actualizar refs
		previousZoomRef.current = currentZoom
		previousBoundsAreaRef.current = currentBoundsArea

		// Log y ejecutar filtrado
		console.log('🔄 [FILTER] Recalculating...', {
			isFirstLoad,
			zoomChanged: zoomChangedSignificantly,
			boundsChanged: boundsAreaChangedSignificantly,
			delay: delay + 'ms',
			zoom: currentZoom,
		})

		const filterTimeoutId = setTimeout(() => {
			try {
				const filtered = filterPointsForViewport(
					points,
					currentZoom,
					currentBounds,
					stableCenter,
					route,
				)

				console.log('✅ [FILTER] Filtered:', {
					input: points.length,
					output: filtered.length,
					ratio: ((filtered.length / points.length) * 100).toFixed(1) + '%',
				})

				// Actualizar refs para useSupercluster
				superclusterBoundsRef.current = currentBounds
				superclusterZoomRef.current = currentZoom

				setFilteredPoints(filtered)
			} catch (error) {
				console.error(`❌ [FILTER] Error:`, error)
				setFilteredPoints([])
			}
		}, delay)

		return () => clearTimeout(filterTimeoutId)
	}, [
		selectedEndPoint,
		points,
		viewport.zoom,
		stableBounds,
		stableCenter,
		route,
	])

	// Usar realZoom para la decisión de clustering
	const realZoom = viewport.zoom ?? MapZoomLevels.DISTRICT
	const shouldUseSupercluster = realZoom <= CLUSTER_USE_UNTIL_ZOOM

	// Log solo cuando cambia la decisión de clustering
	useEffect(() => {
		console.log('🔍 [SUPERCLUSTER] Clustering decision changed:', {
			realZoom,
			CLUSTER_USE_UNTIL_ZOOM,
			shouldUseSupercluster,
		})
	}, [realZoom, shouldUseSupercluster])

	// ✅ OPTIMIZACIÓN: Usar refs estables para evitar recálculos innecesarios
	const { clusters, supercluster } = useSupercluster({
		points: filteredPoints,
		bounds: superclusterBoundsRef.current
			? [
					superclusterBoundsRef.current[0][0],
					superclusterBoundsRef.current[0][1],
					superclusterBoundsRef.current[1][0],
					superclusterBoundsRef.current[1][1],
				]
			: undefined,
		zoom: superclusterZoomRef.current,
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
			setClustersCache(selectedEndPoint, realZoom, binPointClusters)
		}
	}, [selectedEndPoint, clusters, realZoom, setClustersCache])

	const shouldExpandCluster = useCallback(
		(feature: any): boolean => {
			const count = feature.properties.point_count ?? 0
			return (
				count > 0 &&
				(count <= MIN_CLUSTER_SIZE || realZoom >= MapZoomLevels.CLUSTER)
			)
		},
		[realZoom],
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
		realZoom,
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
		})
	}, [
		displayClusters.length,
		shouldUseSupercluster,
		filteredPoints.length,
		realZoom,
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
		isLoading: isLoadingPoints || !selectedEndPoint,
		selectedBinType: selectedEndPoint,
		isUsingIndividualContainers: !shouldUseSupercluster,
		shouldUseSupercluster,
	}
}
