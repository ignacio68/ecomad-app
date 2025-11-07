import {
	BOUNDS_AREA_CHANGE_PERCENT,
	ZOOM_NO_BOUNDS_RECALC,
	ZOOM_RECALC_THRESHOLD,
} from '@map/constants/clustering'
import { useMapNavigationStore } from '@map/stores/mapNavigationStore'
import { useMapViewportStore } from '@map/stores/mapViewportStore'
import { LngLatBounds } from '@map/types/mapData'
import { getCurrentBoundsArea } from '@map/utils/geoUtils'
import { useEffect, useRef } from 'react'

/**
 * Hook que valida si los cambios de viewport son significativos
 * y actualiza los valores validados en el store
 */
export const useMapViewportChanges = () => {
	const { zoom, bounds, center, updateValidatedViewport } =
		useMapViewportStore()
	const { shouldHideClusters } = useMapNavigationStore()

	const previousZoomRef = useRef<number | null>(null)
	const previousBoundsAreaRef = useRef<number | null>(null)

	const firstLoad = (
		center: { lat: number; lng: number },
		bounds: LngLatBounds,
	) => {
		console.log('🎯 [VIEWPORT] First load, initializing validated values', {
			zoom,
			hasBounds: true,
		})
		previousZoomRef.current = zoom
		const currentBoundsArea = getCurrentBoundsArea(bounds)
		previousBoundsAreaRef.current = currentBoundsArea
		updateValidatedViewport(zoom, bounds, center)
	}

	useEffect(() => {
		console.log('[USEMAPVIEWPORTCHANGES] Running')
		if (shouldHideClusters) {
			console.log('🛑 [VIEWPORT] HARD STOP - Route calculation active')
			return
		}

		if (!zoom || !center || !bounds) {
			return
		}

		const isFirstLoad = previousZoomRef.current === null

		if (isFirstLoad) {
			firstLoad(center, bounds)
			return
		}

		console.log('🎯 [VIEWPORT] Validating viewport changes')

		const zoomDiff = previousZoomRef?.current
			? zoom - previousZoomRef.current
			: 0
		const hasSignificantZoomChange = Math.abs(zoomDiff) >= ZOOM_RECALC_THRESHOLD
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

		// El clustering jerárquico se maneja en useHierarchicalBins
		// No necesitamos filtrado ni clustering imperativo aquí
	}, [zoom, bounds, center, shouldHideClusters, updateValidatedViewport])
}
