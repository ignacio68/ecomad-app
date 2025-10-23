import { INITIAL_BOUNDS, INITIAL_CENTER } from '@map/constants/map'
import { ensureDataAvailable } from '@map/services/binsCacheService'
import {
	clearBinsCache,
	filterPointsForViewport,
	loadContainersAsGeoJSON,
	type BinsCache,
} from '@map/services/binsLoader'
import { calculateAndStoreClusters } from '@map/services/clusteringService'
import { useMapBinsStore } from '@map/stores/mapBinsStore'
import { useMapChipsMenuStore } from '@map/stores/mapChipsMenuStore'
import { useMapClustersStore } from '@map/stores/mapClustersStore'
import { useMapNavigationStore } from '@map/stores/mapNavigationStore'
import { useMapViewportStore } from '@map/stores/mapViewportStore'
import { useSuperclusterCacheStore } from '@map/stores/superclusterCacheStore'
import { MapZoomLevels } from '@map/types/mapData'
import { useEffect, useState } from 'react'

export const useSuperclusterBins = () => {
	const { lastValidatedZoom, lastValidatedBounds, lastValidatedCenter } =
		useMapViewportStore()
	const { selectedEndPoint } = useMapChipsMenuStore()
	const { shouldHideClusters } = useMapNavigationStore()
	const { setPointsCache, getPointsCache, clearPointsCache } =
		useSuperclusterCacheStore()
	const { allPoints, setAllPoints, setFilteredPoints } = useMapBinsStore()
	const { displayClusters, superclusterInstance } = useMapClustersStore()

	const [isLoadingPoints, setIsLoadingPoints] = useState(false)

	// Cache object
	const binsCache: BinsCache = {
		get: getPointsCache,
		set: setPointsCache,
		clear: clearPointsCache,
	}

	const hasNoData = !selectedEndPoint && allPoints.length === 0

	// ✅ Efecto para cargar puntos cuando se selecciona un chip
	useEffect(() => {
		let isMounted = true

		const loadPoints = async () => {
			if (!selectedEndPoint) {
				setAllPoints([])
				setFilteredPoints([])
				clearBinsCache(binsCache)
				setIsLoadingPoints(false)
				return
			}

			setIsLoadingPoints(true)

			try {
				await ensureDataAvailable(selectedEndPoint)
				if (!isMounted) return

				const loadedPoints = await loadContainersAsGeoJSON(
					selectedEndPoint,
					binsCache,
				)
				if (!isMounted) return

				// Guardar todos los puntos en el store
				setAllPoints(loadedPoints)

				// ✅ FILTRADO IMPERATIVO: Primera carga del chip (siempre)
				console.log('🎯 [CHIP_SELECT] Filtering with validated values', {
					zoom: lastValidatedZoom,
					hasBounds: lastValidatedBounds,
				})

				const filtered = filterPointsForViewport(
					loadedPoints,
					lastValidatedZoom ?? MapZoomLevels.DISTRICT,
					lastValidatedBounds ?? INITIAL_BOUNDS,
					lastValidatedCenter ?? {
						lat: INITIAL_CENTER[1],
						lng: INITIAL_CENTER[0],
					},
					null,
				)
				setFilteredPoints(filtered)

				// ✅ CLUSTERING IMPERATIVO: Calcular clusters iniciales
				calculateAndStoreClusters(
					filtered,
					lastValidatedZoom ?? MapZoomLevels.DISTRICT,
					lastValidatedBounds ?? INITIAL_BOUNDS,
				)

				setIsLoadingPoints(false)
			} catch (error) {
				console.error('❌ Error loading points:', error)
				if (!isMounted) return
				setAllPoints([])
				setFilteredPoints([])
				setIsLoadingPoints(false)
			}
		}

		loadPoints()

		return () => {
			isMounted = false
		}
	}, [selectedEndPoint])

	// ✅ RETORNO SIMPLE: Solo leer del store (sin useMemo, sin useEffect, sin useCallback)
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

	// Ocultar clusters mientras se calcula la ruta
	if (shouldHideClusters) {
		console.log('🚫 [ROUTE_CALC] Hiding clusters while calculating route')
		return {
			clusters: [],
			supercluster: superclusterInstance,
			points: allPoints,
			isLoading: true,
			selectedBinType: selectedEndPoint,
			isUsingIndividualContainers: false,
			shouldUseSupercluster: false,
		}
	}

	return {
		clusters: displayClusters,
		supercluster: superclusterInstance,
		points: allPoints,
		isLoading: isLoadingPoints || !selectedEndPoint,
		selectedBinType: selectedEndPoint,
		isUsingIndividualContainers: false,
		shouldUseSupercluster: true,
	}
}
