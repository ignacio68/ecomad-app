import { create } from 'zustand'

interface MapViewport {
	zoom: number
	bounds: {
		minLat: number
		minLng: number
		maxLat: number
		maxLng: number
	} | null
}

interface MapViewportStore {
	viewport: MapViewport
	setZoom: (zoom: number) => void
	setBounds: (bounds: MapViewport['bounds']) => void
	setViewport: (viewport: Partial<MapViewport>) => void
}

export const useMapViewportStore = create<MapViewportStore>(set => ({
	viewport: {
		zoom: 10,
		bounds: null,
	},
	setZoom: zoom => {
		set(state => {
			console.log(
				`🏪 Store: Updating zoom from ${state.viewport.zoom} to ${zoom}`,
			)
			return {
				viewport: { ...state.viewport, zoom },
			}
		})
	},
	setBounds: bounds =>
		set(state => ({
			viewport: { ...state.viewport, bounds },
		})),
	setViewport: viewport =>
		set(state => ({
			viewport: { ...state.viewport, ...viewport },
		})),
}))
