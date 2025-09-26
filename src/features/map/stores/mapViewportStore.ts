import { Bounds } from '@/shared/types/search'
import { create } from 'zustand'
import { MapZoomLevels } from '../types/mapData'

interface MapViewport {
	zoom: number
	bounds: Bounds | null
	center: {
		lat: number
		lng: number
	} | null
}

interface MapViewportStore {
	viewport: MapViewport
	setZoom: (zoom: number) => void
	setBounds: (bounds: MapViewport['bounds']) => void
	setCenter: (center: MapViewport['center']) => void
	setViewport: (viewport: Partial<MapViewport>) => void
}

export const useMapViewportStore = create<MapViewportStore>(set => ({
	viewport: {
		zoom: MapZoomLevels.DISTRICT,
		bounds: null,
		center: null,
	},
	setZoom: zoom => {
		set(state => ({
			viewport: { ...state.viewport, zoom },
		}))
	},
	setBounds: bounds =>
		set(state => ({
			viewport: { ...state.viewport, bounds },
		})),
	setCenter: center =>
		set(state => ({
			viewport: { ...state.viewport, center },
		})),
	setViewport: viewport =>
		set(state => ({
			viewport: { ...state.viewport, ...viewport },
		})),
}))
