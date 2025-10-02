import { create } from 'zustand'
import { LngLatBounds, MapZoomLevels } from '../types/mapData'

interface MapViewport {
	zoom: number
	bounds: LngLatBounds | null // [sw, ne] formato Mapbox estándar
	center: {
		lat: number
		lng: number
	} | null
}
export interface MapViewportStore {
	viewport: MapViewport
	shouldAnimate: boolean
	setZoom: (zoom: number) => void
	setBounds: (bounds: MapViewport['bounds']) => void
	setCenter: (center: MapViewport['center']) => void
	setViewport: (viewport: Partial<MapViewport>) => void
	setViewportAnimated: (viewport: Partial<MapViewport>) => void
	resetAnimation: () => void
	updateBoundsFromMap: (getVisibleBoundsFn: () => Promise<any>) => Promise<void>
}

export const useMapViewportStore = create<MapViewportStore>(set => ({
	viewport: {
		zoom: MapZoomLevels.DISTRICT,
		bounds: null,
		center: { lat: 40.4168, lng: -3.7038 }, // Madrid por defecto
	},
	shouldAnimate: false,
	setZoom: zoom => {
		set(state => {
			if (Math.abs((state.viewport.zoom ?? 0) - zoom) < 1e-6) {
				return state
			}
			return {
				viewport: { ...state.viewport, zoom },
				shouldAnimate: false,
			}
		})
	},
	setBounds: bounds =>
		set(state => {
			const current = state.viewport.bounds
			if (current && bounds) {
				const [currentSW, currentNE] = current
				const [newSW, newNE] = bounds
				const isEqual =
					Math.abs(currentSW[0] - newSW[0]) < 1e-6 && // lng
					Math.abs(currentSW[1] - newSW[1]) < 1e-6 && // lat
					Math.abs(currentNE[0] - newNE[0]) < 1e-6 && // lng
					Math.abs(currentNE[1] - newNE[1]) < 1e-6 // lat
				if (isEqual) {
					if (__DEV__) {
						console.log(`🔍 setBounds: Bounds are equal, not updating`)
					}
					return state
				}
			}
			if (!current && !bounds) {
				return state
			}
			if (__DEV__) {
				console.log(`🔍 setBounds: Updating bounds from`, current, `to`, bounds)
			}
			return {
				viewport: { ...state.viewport, bounds },
				shouldAnimate: false,
			}
		}),
	setCenter: center =>
		set(state => {
			const current = state.viewport.center
			if (
				current &&
				center &&
				Math.abs(current.lat - center.lat) < 1e-6 &&
				Math.abs(current.lng - center.lng) < 1e-6
			) {
				return state
			}
			if (!current && !center) {
				return state
			}
			// Log solo en desarrollo
			if (__DEV__) {
				console.log('🔍 Setting center in store:', center)
			}
			return {
				viewport: { ...state.viewport, center },
				shouldAnimate: false,
			}
		}),
	setViewport: viewport =>
		set(state => {
			const next = { ...state.viewport, ...viewport }
			const sameZoom =
				Math.abs((state.viewport.zoom ?? 0) - (next.zoom ?? 0)) < 1e-6
			const sameCenter =
				state.viewport.center &&
				next.center &&
				Math.abs(state.viewport.center.lat - next.center.lat) < 1e-6 &&
				Math.abs(state.viewport.center.lng - next.center.lng) < 1e-6
			const sameBounds = (() => {
				const a = state.viewport.bounds
				const b = next.bounds
				if (!a && !b) return true
				if (!a || !b) return false
				const [aSW, aNE] = a
				const [bSW, bNE] = b
				return (
					Math.abs(aSW[0] - bSW[0]) < 1e-6 && // lng
					Math.abs(aSW[1] - bSW[1]) < 1e-6 && // lat
					Math.abs(aNE[0] - bNE[0]) < 1e-6 && // lng
					Math.abs(aNE[1] - bNE[1]) < 1e-6 // lat
				)
			})()
			if (sameZoom && sameCenter && sameBounds) {
				return state
			}
			return {
				viewport: next,
				shouldAnimate: false,
			}
		}),
	setViewportAnimated: viewport =>
		set(state => ({
			viewport: { ...state.viewport, ...viewport },
			shouldAnimate: true,
		})),
	resetAnimation: () => set({ shouldAnimate: false }),
	updateBoundsFromMap: async getVisibleBoundsFn => {
		try {
			const bounds = await getVisibleBoundsFn()
			if (__DEV__) {
				console.log(`🔍 Raw bounds from getVisibleBounds():`, bounds)
			}

			if (bounds && Array.isArray(bounds) && bounds.length === 2) {
				// getVisibleBounds() devuelve [[lng, lat], [lng, lat]]
				// Necesitamos determinar cuál es sw y cuál es ne basado en las coordenadas
				const [point1, point2] = bounds

				// sw tiene menor latitud y menor longitud
				// ne tiene mayor latitud y mayor longitud
				const newBounds: LngLatBounds = [
					[Math.min(point1[0], point2[0]), Math.min(point1[1], point2[1])], // sw: [min_lng, min_lat]
					[Math.max(point1[0], point2[0]), Math.max(point1[1], point2[1])], // ne: [max_lng, max_lat]
				]

				set(state => ({
					viewport: { ...state.viewport, bounds: newBounds },
				}))
				if (__DEV__) {
					console.log(`🔍 Updated bounds (LngLatBounds format):`, newBounds)
				}
			}
		} catch (error) {
			console.warn(`⚠️ Error getting visible bounds:`, error)
		}
	},
}))
