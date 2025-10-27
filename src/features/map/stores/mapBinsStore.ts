import { BinPoint } from '@map/types/mapData'
import { create } from 'zustand'

interface MapBinsStore {
	// Todos los puntos cargados del binType seleccionado
	allPoints: BinPoint[]
	// Puntos filtrados según viewport/ruta
	filteredPoints: BinPoint[]
	// Actions
	setAllPoints: (points: BinPoint[]) => void
	setFilteredPoints: (points: BinPoint[]) => void
	clearBins: () => void
}

export const useMapBinsStore = create<MapBinsStore>(set => ({
	allPoints: [],
	filteredPoints: [],
	setAllPoints: points => {
		console.log('📦 [BINS_STORE] Setting all points:', points.length)
		set({ allPoints: points })
	},
	setFilteredPoints: points => {
		console.log('🔍 [BINS_STORE] Setting filtered points:', points.length)
		set({ filteredPoints: points })
	},
	clearBins: () => {
		console.log('🧹 [BINS_STORE] Clearing bins')
		set({ allPoints: [], filteredPoints: [] })
	},
}))

