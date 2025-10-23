import {
	CENTER_THRESHOLD,
	INITIAL_BOUNDS,
	INITIAL_CENTER,
	ZOOM_THRESHOLD,
} from '@map/constants/map'
import { expandBoundsWithBuffer } from '@map/services/mapService'
import { LngLatBounds, MapZoomLevels, MapViewport } from '@map/types/mapData'
import { create } from 'zustand'

export interface MapViewportStore {
	// Raw values (se actualizan siempre)
	zoom: number
	bounds: LngLatBounds | null
	center: {
		lat: number
		lng: number
	} | null

	// Validated values (solo cuando cambian significativamente)
	lastValidatedZoom: number | null
	lastValidatedBounds: LngLatBounds | null
	lastValidatedCenter: {
		lat: number
		lng: number
	} | null

	// Legacy (mantener para compatibilidad)
	viewport: MapViewport
	shouldAnimate: boolean
	isProgrammaticMove: boolean

	// Actions
	setZoom: (zoom: number) => void
	setBounds: (bounds: LngLatBounds | null) => void
	setCenter: (center: { lat: number; lng: number } | null) => void
	updateValidatedViewport: (
		zoom: number,
		bounds: LngLatBounds | null,
		center: { lat: number; lng: number },
	) => void
	setViewportBatch: (updates: {
		zoom?: number
		bounds?: LngLatBounds
		center?: { lat: number; lng: number }
	}) => void
	setViewportAnimated: (viewport: Partial<MapViewport>) => void
	resetAnimation: () => void
	resetProgrammaticMove: () => void
}

export const useMapViewportStore = create<MapViewportStore>(set => ({
	// Raw values
	zoom: MapZoomLevels.DISTRICT,
	bounds: null,
	center: { lat: INITIAL_CENTER[1], lng: INITIAL_CENTER[0] },

	// Validated values (inicializados para que funcione desde el inicio)
	lastValidatedZoom: MapZoomLevels.DISTRICT,
	lastValidatedBounds: INITIAL_BOUNDS,
	lastValidatedCenter: { lat: INITIAL_CENTER[1], lng: INITIAL_CENTER[0] },

	// Legacy
	viewport: {
		zoom: MapZoomLevels.DISTRICT,
		bounds: null,
		center: { lat: INITIAL_CENTER[1], lng: INITIAL_CENTER[0] },
	},
	shouldAnimate: false,
	isProgrammaticMove: false,
	setZoom: zoom => {
		set(state => {
			if (Math.abs((state.viewport.zoom ?? 0) - zoom) < ZOOM_THRESHOLD) {
				return state
			}
			return {
				viewport: { ...state.viewport, zoom },
				shouldAnimate: false,
			}
		})
	},
	setBounds: rawBounds =>
		set(state => {
			const current = state.viewport.bounds
			const currentZoom = state.viewport.zoom

			if (!rawBounds) {
				return state
			}

			const processedBounds = expandBoundsWithBuffer(rawBounds, currentZoom)

			if (current && processedBounds) {
				const [currentSW, currentNE] = current
				const [newSW, newNE] = processedBounds
				const isEqual =
					Math.abs(currentSW[0] - newSW[0]) < CENTER_THRESHOLD && // lng
					Math.abs(currentSW[1] - newSW[1]) < CENTER_THRESHOLD && // lat
					Math.abs(currentNE[0] - newNE[0]) < CENTER_THRESHOLD && // lng
					Math.abs(currentNE[1] - newNE[1]) < CENTER_THRESHOLD // lat
				if (isEqual) {
					return state
				}
			}
			if (!current && !processedBounds) {
				return state
			}
			if (__DEV__) {
				console.log(
					`🔍 setBounds: Updating bounds from`,
					current,
					`to`,
					processedBounds,
				)
			}
			return {
				viewport: { ...state.viewport, bounds: processedBounds },
				shouldAnimate: false,
			}
		}),
	setCenter: center =>
		set(state => {
			const current = state.viewport.center

			if (!center) {
				return state
			}

			if (
				current &&
				Math.abs(current.lat - center.lat) < CENTER_THRESHOLD &&
				Math.abs(current.lng - center.lng) < CENTER_THRESHOLD
			) {
				return state
			}

			return {
				viewport: { ...state.viewport, center },
				shouldAnimate: false,
			}
		}),
	setViewportBatch: updates =>
		set(state => {
			const newViewport = { ...state.viewport }
			let hasChanges = false

			// Actualizar zoom si se proporciona
			if (updates.zoom !== undefined) {
				if (
					Math.abs((state.viewport.zoom ?? 0) - updates.zoom) >= ZOOM_THRESHOLD
				) {
					newViewport.zoom = updates.zoom
					hasChanges = true
				}
			}

			// Actualizar center si se proporciona
			if (updates.center) {
				const current = state.viewport.center
				if (
					!current ||
					Math.abs(current.lat - updates.center.lat) >= CENTER_THRESHOLD ||
					Math.abs(current.lng - updates.center.lng) >= CENTER_THRESHOLD
				) {
					newViewport.center = updates.center
					hasChanges = true
				}
			}

			// Actualizar bounds si se proporciona
			if (updates.bounds) {
				const processedBounds = expandBoundsWithBuffer(
					updates.bounds,
					newViewport.zoom,
				)
				const current = state.viewport.bounds

				if (current && processedBounds) {
					const [currentSW, currentNE] = current
					const [newSW, newNE] = processedBounds
					const isEqual =
						Math.abs(currentSW[0] - newSW[0]) < CENTER_THRESHOLD &&
						Math.abs(currentSW[1] - newSW[1]) < CENTER_THRESHOLD &&
						Math.abs(currentNE[0] - newNE[0]) < CENTER_THRESHOLD &&
						Math.abs(currentNE[1] - newNE[1]) < CENTER_THRESHOLD

					if (!isEqual) {
						newViewport.bounds = processedBounds
						hasChanges = true
					}
				} else if (!current || !processedBounds) {
					newViewport.bounds = processedBounds
					hasChanges = true
				}
			}

			if (!hasChanges) {
				return state
			}

			if (__DEV__) {
				console.log('🔄 [BATCH] Viewport updated:', {
					zoom:
						updates.zoom !== undefined
							? `${state.viewport.zoom} → ${newViewport.zoom}`
							: 'unchanged',
					center: updates.center ? 'updated' : 'unchanged',
					bounds: updates.bounds ? 'updated' : 'unchanged',
				})
			}

			return {
				viewport: newViewport,
				shouldAnimate: false,
			}
		}),
	updateValidatedViewport: (zoom, bounds, center) =>
		set(state => {
			console.log('✅ [VIEWPORT] Updating validated viewport', {
				zoom,
				boundsUpdated: !!bounds,
				centerUpdated: !!center,
			})
			return {
				lastValidatedZoom: zoom,
				lastValidatedBounds: bounds,
				lastValidatedCenter: center,
			}
		}),
	setViewportAnimated: viewport =>
		set(state => ({
			viewport: { ...state.viewport, ...viewport },
			shouldAnimate: true,
			isProgrammaticMove: true,
		})),
	resetAnimation: () => set({ shouldAnimate: false }),
	resetProgrammaticMove: () => set({ isProgrammaticMove: false }),
}))
