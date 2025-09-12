import { create } from 'zustand'
import type { MapData } from '../hooks/useMapDataByZoom'

interface MapDataStore {
	mapData: MapData
	setMapData: (mapData: MapData) => void
	clearMapData: () => void
}

export const useMapDataStore = create<MapDataStore>(set => ({
	mapData: {
		type: 'district',
		data: [],
		loading: false,
		error: null,
	},
	setMapData: mapData => set({ mapData }),
	clearMapData: () =>
		set({
			mapData: {
				type: 'district',
				data: [],
				loading: false,
				error: null,
			},
		}),
}))
