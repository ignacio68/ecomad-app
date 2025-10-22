import {
	BOUNDS_AREA_CHANGE_PERCENT,
	ZOOM_NO_BOUNDS_RECALC,
	ZOOM_RECALC_THRESHOLD,
} from '@map/constants/clustering'
import { filterPointsForViewport } from '@map/services/binsLoader'
import { calculateAndStoreClusters } from '@map/services/clusteringService'
import { useMapBinsStore } from '@map/stores/mapBinsStore'
import { useMapChipsMenuStore } from '@map/stores/mapChipsMenuStore'
import { useMapNavigationStore } from '@map/stores/mapNavigationStore'
import { useMapViewportStore } from '@map/stores/mapViewportStore'
import { getCurrentBoundsArea } from '@map/utils/geoUtils'
import { useEffect, useRef } from 'react'

/**
 * Hook que valida si los cambios de viewport son significativos
 * y actualiza los valores validados en el store
 */
export const useMapViewportChanges = () => {
	const { zoom, bounds, center, updateValidatedViewport } =
		useMapViewportStore()
	const { shouldHideClusters, route } = useMapNavigationStore()
	const { selectedEndPoint } = useMapChipsMenuStore()
	const { allPoints } = useMapBinsStore()

	const previousZoomRef = useRef<number | null>(null)
	const previousBoundsAreaRef = useRef<number | null>(null)

	useEffect(() => {
		// 🛑 HARD STOP: Si está calculando ruta, no validar cambios
		if (shouldHideClusters) {
			console.log('🛑 [VIEWPORT] HARD STOP - Route calculation active')
			return
		}

		if (!zoom || !center) {
			return
		}

		const isFirstLoad = previousZoomRef.current === null

		// Primera carga: solo actualizar si hay bounds disponibles
		if (isFirstLoad) {
			if (!bounds) {
				console.log('⏳ [VIEWPORT] First load but no bounds yet, waiting...')
				return
			}

			console.log('🎯 [VIEWPORT] First load, initializing validated values', {
				zoom,
				hasBounds: true,
			})
			previousZoomRef.current = zoom
			const currentBoundsArea = getCurrentBoundsArea(bounds)
			previousBoundsAreaRef.current = currentBoundsArea
			updateValidatedViewport(zoom, bounds, center)
			return
		}

		if (!bounds) {
			return
		}

		// Validar cambio de zoom
		const zoomDiff =
			previousZoomRef.current !== null ? zoom - previousZoomRef.current : 0
		const hasSignificantZoomChange = Math.abs(zoomDiff) >= ZOOM_RECALC_THRESHOLD

		// Validar cambio de bounds
		let currentBoundsArea = 0
		let hasSignificantBoundsChange = false

		try {
			currentBoundsArea = getCurrentBoundsArea(bounds)

			if (previousBoundsAreaRef.current !== null) {
				const areaDiffPercent =
					(Math.abs(currentBoundsArea - previousBoundsAreaRef.current) /
						previousBoundsAreaRef.current) *
					100
				hasSignificantBoundsChange =
					areaDiffPercent > BOUNDS_AREA_CHANGE_PERCENT

				console.log('📐 [VIEWPORT] Bounds area comparison:', {
					prevArea: previousBoundsAreaRef.current.toFixed(0) + 'm²',
					currArea: currentBoundsArea.toFixed(0) + 'm²',
					diffPercent: areaDiffPercent.toFixed(1) + '%',
					significant: hasSignificantBoundsChange,
				})
			}
		} catch (error) {
			console.warn('⚠️ [VIEWPORT] Error calculating bounds area:', error)
			hasSignificantBoundsChange = true
		}

		// Early return: Sin cambios significativos
		if (
			!isFirstLoad &&
			!hasSignificantZoomChange &&
			!hasSignificantBoundsChange
		) {
			console.log('✅ [VIEWPORT] No significant changes, skipping update')
			return
		}

		// Early return: Zoom bajo + solo bounds cambiaron
		if (
			hasSignificantBoundsChange &&
			!hasSignificantZoomChange &&
			zoom < ZOOM_NO_BOUNDS_RECALC
		) {
			console.log('🚫 [VIEWPORT] Low zoom, ignoring bounds change', {
				zoom,
				threshold: ZOOM_NO_BOUNDS_RECALC,
			})
			return
		}

		// Actualizar refs
		previousZoomRef.current = zoom
		previousBoundsAreaRef.current = currentBoundsArea

		// Actualizar valores validados en el store
		console.log(
			'✅ [VIEWPORT] Significant changes detected, updating validated values',
			{
				isFirstLoad,
				hasSignificantZoomChange,
				hasSignificantBoundsChange,
				zoom,
			},
		)

		updateValidatedViewport(zoom, bounds, center)

		// ✅ FILTRADO IMPERATIVO: Si hay chip seleccionado y puntos cargados
		if (selectedEndPoint && allPoints.length > 0) {
			console.log('🔄 [VIEWPORT] Filtering points imperatively', {
				pointsCount: allPoints.length,
				zoom,
			})

			try {
				// Obtener allPoints actual del store para evitar dependencia reactiva
				const { allPoints: currentPoints } = useMapBinsStore.getState()

				const filtered = filterPointsForViewport(
					currentPoints,
					zoom,
					bounds,
					center,
					route,
				)

				console.log('✅ [VIEWPORT] Filtered:', {
					input: currentPoints.length,
					output: filtered.length,
					ratio:
						((filtered.length / currentPoints.length) * 100).toFixed(1) + '%',
				})

				useMapBinsStore.getState().setFilteredPoints(filtered)

				// ✅ CLUSTERING IMPERATIVO: Calcular clusters y guardar en store
				calculateAndStoreClusters(filtered, zoom, bounds)
			} catch (error) {
				console.error('❌ [VIEWPORT] Error filtering:', error)
				useMapBinsStore.getState().setFilteredPoints([])
			}
		}
	}, [
		zoom,
		bounds,
		center,
		shouldHideClusters,
		updateValidatedViewport,
		selectedEndPoint,
		allPoints.length, // Solo el length para detectar cuando se cargan puntos
		route,
	])
}
