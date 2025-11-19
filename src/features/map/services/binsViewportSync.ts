import { showIndividualBins } from '@map/services/clusterDisplayService'
import { createFallbackBounds } from '@map/services/mapService'
import { isViewportSyncPaused } from '@map/services/viewportSyncController'
import { useBinsCountStore } from '@map/stores/binsCountStore'
import { useMapChipsMenuStore } from '@map/stores/mapChipsMenuStore'
import { useMapNavigationStore } from '@map/stores/mapNavigationStore'
import { useMapViewportStore } from '@map/stores/mapViewportStore'
import { useSuperclusterCacheStore } from '@map/stores/superclusterCacheStore'
import type { LngLatBounds, MapViewport } from '@map/types/mapData'
import {
	hasSignificantCenterChange,
	hasSignificantZoomChange,
} from '@map/utils/mapUtils'

let started = false
let debounceTimer: ReturnType<typeof setTimeout> | null = null

export const startBinsViewportSync = () => {
	if (started) return
	started = true

	if (__DEV__) {
		console.log('🟢 [SYNC] startBinsViewportSync called')
	}

	useMapViewportStore.subscribe(async (state, prevState) => {
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

		// Comparar con el último zoom validado para detectar cambios reales
		const { lastValidatedZoom, lastValidatedCenter } =
			useMapViewportStore.getState()

		const zoomChanged = hasSignificantZoomChange(
			lastValidatedZoom,
			viewport.zoom ?? 11,
		)

		const centerChanged = hasSignificantCenterChange(
			lastValidatedCenter,
			viewport.center!,
		)

		// Detectar cruce del umbral de zoom 14 (clusters <-> bins individuales)
		const INDIVIDUAL_BINS_ZOOM_THRESHOLD = 14
		const prevZoom = lastValidatedZoom ?? 11
		const currZoom = viewport.zoom ?? 11
		const crossedThreshold =
			(prevZoom < INDIVIDUAL_BINS_ZOOM_THRESHOLD &&
				currZoom >= INDIVIDUAL_BINS_ZOOM_THRESHOLD) ||
			(prevZoom >= INDIVIDUAL_BINS_ZOOM_THRESHOLD &&
				currZoom < INDIVIDUAL_BINS_ZOOM_THRESHOLD)

		if (__DEV__) {
			console.log('🔍 [SYNC] Checking viewport changes:', {
				zoomChanged,
				centerChanged,
				crossedThreshold,
				prevZoom: prevViewport?.zoom,
				currZoom: viewport.zoom,
				prevCenter: prevViewport?.center,
				currCenter: viewport.center,
			})
		}

		// En zoom bajo (< 11), ignorar cambios de center (pan) para evitar recálculos innecesarios
		// Solo actualizar cuando cambia el zoom o se cruza el umbral
		const LOW_ZOOM_THRESHOLD = 11
		const isLowZoom = (viewport.zoom ?? 11) < LOW_ZOOM_THRESHOLD

		// Si es zoom bajo y solo cambió el center (pan), ignorar
		if (isLowZoom && !zoomChanged && !crossedThreshold && centerChanged) {
			if (__DEV__) {
				console.log('⏭️ [SYNC] Low zoom pan ignored, skipping recalculation', {
					zoom: viewport.zoom,
					centerChanged,
				})
			}
			return
		}

		// Si solo cambió el center (pan) y ya tenemos todos los bins descargados,
		// ignorar para evitar recálculos innecesarios (el filtrado por bounds es suficiente)
		if (!zoomChanged && !crossedThreshold && centerChanged) {
			const { selectedEndPoint } = useMapChipsMenuStore.getState()
			if (selectedEndPoint) {
				const { getPointsCache } = useSuperclusterCacheStore.getState()
				const cachedBins = getPointsCache(selectedEndPoint)

				// Verificar si tenemos todos los bins descargados usando el store síncrono
				if (cachedBins && cachedBins.length > 0) {
					const totalCount = useBinsCountStore
						.getState()
						.getTotalCount(selectedEndPoint)
					// Si tenemos más de 5000 bins o el 95% del total, asumimos que tenemos todos
					const hasAllBins =
						cachedBins.length > 5000 ||
						(totalCount !== null && cachedBins.length >= totalCount * 0.95)

					if (hasAllBins) {
						if (__DEV__) {
							console.log('⏭️ [SYNC] Pan ignored, all bins already cached', {
								zoom: viewport.zoom,
								cachedBins: cachedBins.length,
								totalCount,
							})
						}
						// Actualizar viewport validado pero no recalcular bins
						const safeBounds: LngLatBounds =
							viewport.bounds ??
							createFallbackBounds(
								viewport.center!.lng,
								viewport.center!.lat,
								viewport.zoom,
							)
						updateValidatedViewport(viewport.zoom, safeBounds, viewport.center!)
						return
					}
				}
			}
		}

		// Actualizar si hay cambios significativos O si cruzamos el umbral de zoom 14
		if (!zoomChanged && !centerChanged && !crossedThreshold) {
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

		// Actualizar bins cuando hay cambios significativos
		const { selectedEndPoint } = useMapChipsMenuStore.getState()
		const { route } = useMapNavigationStore.getState()

		if (selectedEndPoint && viewport.center) {
			// Limpiar debounce anterior
			if (debounceTimer) {
				clearTimeout(debounceTimer)
			}

			// Usar debounce para evitar llamadas excesivas durante pan continuo
			// Pero permitir actualizaciones más rápidas para zoom
			const debounceDelay = zoomChanged || crossedThreshold ? 50 : 200

			debounceTimer = setTimeout(() => {
				showIndividualBins(
					selectedEndPoint,
					viewport.zoom ?? 11,
					safeBounds,
					viewport.center!,
					route,
				).catch(error => {
					console.error(
						'❌ [SYNC] Error showing bins after viewport change:',
						error,
					)
				})
				debounceTimer = null
			}, debounceDelay)
		}
	})
}
