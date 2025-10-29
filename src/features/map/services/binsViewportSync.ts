// binsViewportSync.ts
import { CENTER_THRESHOLD, ZOOM_THRESHOLD } from '@map/constants/map'
import { calculatePoints } from '@map/services/mapService'
import { useMapViewportStore } from '@map/stores/mapViewportStore'
import type { MapViewport } from '@map/types/mapData'

const isSignificantZoom = (prev: number | null, next: number) =>
	prev == null || Math.abs((prev ?? 0) - next) >= ZOOM_THRESHOLD

const isSignificantCenter = (
	prev: { lat: number; lng: number } | null,
	next: { lat: number; lng: number },
) =>
	!prev ||
	Math.abs((prev?.lat ?? 0) - next.lat) >= CENTER_THRESHOLD ||
	Math.abs((prev?.lng ?? 0) - next.lng) >= CENTER_THRESHOLD

let started = false

export const startBinsViewportSync = () => {
	if (started) return
	started = true

	useMapViewportStore.subscribe(
		s => s.viewport, // observamos zoom/center/bounds "raw"
		(vp, prevVp) => {
			const zoomChanged = isSignificantZoom(prevVp?.zoom ?? null, vp.zoom)
			const centerChanged = isSignificantCenter(
				prevVp?.center ?? null,
				vp.center,
			)

			if (!zoomChanged && !centerChanged) return

			// 1) registra "validated" (bounds los podemos dejar en null)
			useMapViewportStore
				.getState()
				.updateValidatedViewport(vp.zoom, null, vp.center!)

			// 2) dispara cálculo (bounds se autogeneran dentro de calculatePoints)
			calculatePoints(vp as MapViewport)
		},
		{ fireImmediately: false },
	)
}
