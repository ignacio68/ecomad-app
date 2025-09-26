import { create } from 'zustand'
import type { MapData } from '../types/mapData'

interface MapDataStore {
	mapData: MapData
	setMapData: (mapData: MapData) => void
	clearMapData: () => void
	setLoading: (loading: boolean) => void
	setError: (error: string | null) => void
}

export const useMapDataStore = create<MapDataStore>(set => ({
	mapData: {
		type: 'districts',
		data: [],
		loading: false,
		error: null,
		endPoint: null,
	},
	setMapData: mapData => {
		// console.log(`📦 STORE: Setting mapData - type=${mapData.type}, items=${mapData.data.length}`)
		set({ mapData })
	},
	clearMapData: () =>
		set({
			mapData: {
				type: 'districts',
				data: [],
				loading: false,
				error: null,
				endPoint: null,
			},
		}),
	setLoading: (loading: boolean) =>
		set(state => ({
			mapData: { ...state.mapData, loading, error: null },
		})),
	setError: (error: string | null) =>
		set(state => ({
			mapData: { ...state.mapData, error, loading: false },
		})),
}))
