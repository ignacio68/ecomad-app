import { createFallbackBounds } from '@map/services/mapService'
import { isViewportSyncPaused } from '@map/services/viewportSyncController'
import { useMapViewportStore } from '@map/stores/mapViewportStore'
import type { LngLatBounds, MapViewport } from '@map/types/mapData'
import {
	hasSignificantCenterChange,
	hasSignificantZoomChange,
} from '@map/utils/mapUtils'

let started = false

export const startBinsViewportSync = () => {
	if (started) return
	started = true

	if (__DEV__) {
		console.log('🟢 [SYNC] startBinsViewportSync called')
	}

	useMapViewportStore.subscribe((state, prevState) => {
		if (__DEV__) {
			console.log('🪝 [SYNC] subscribe tick')
		}

		if (isViewportSyncPaused()) {
			if (__DEV__) {
				console.log('⏸️ [SYNC] Paused by controller')
			}
			return
		}

		const { shouldAnimate, isProgrammaticMove, updateValidatedViewport } =
			useMapViewportStore.getState()
		if (shouldAnimate || isProgrammaticMove) {
			if (__DEV__) {
				console.log('⏭️ [SYNC] Skipping due to animation/programmatic move', {
					shouldAnimate,
					isProgrammaticMove,
				})
			}
			return
		}

		const viewport: MapViewport = state.viewport
		const prevViewport: MapViewport | null = prevState?.viewport ?? null

		const zoomChanged = hasSignificantZoomChange(
			prevViewport?.zoom ?? null,
			viewport.zoom,
		)

		const centerChanged = hasSignificantCenterChange(
			prevViewport?.center ?? null,
			viewport.center!,
		)

		if (__DEV__) {
			console.log('🔍 [SYNC] Checking viewport changes:', {
				zoomChanged,
				centerChanged,
				prevZoom: prevViewport?.zoom,
				currZoom: viewport.zoom,
				prevCenter: prevViewport?.center,
				currCenter: viewport.center,
			})
		}

		if (!zoomChanged && !centerChanged) {
			if (__DEV__) {
				console.log('⏭️ [SYNC] No significant changes, skipping', {
					prevViewport,
					currViewport: state.viewport,
				})
			}
			return
		}

		// ✅ Bounds seguros: prioriza los reales; si no hay, usa fallback determinista
		const safeBounds: LngLatBounds =
			viewport.bounds ??
			createFallbackBounds(
				viewport.center!.lng,
				viewport.center!.lat,
				viewport.zoom,
			)

		// ✅ Actualiza SIEMPRE los valores validados
		// El clustering jerárquico se maneja reactivamente en useHierarchicalBins
		updateValidatedViewport(viewport.zoom, safeBounds, viewport.center!)
	})
}
