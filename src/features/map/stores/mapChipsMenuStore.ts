import type { BinType } from '@/shared/types/bins'
import { create } from 'zustand'
import { useMapBinsStore } from './mapBinsStore'
import { useMapBottomSheetStore } from './mapBottomSheetStore'
import { useMapClustersStore } from './mapClustersStore'
import { useMapNavigationStore } from './mapNavigationStore'

interface MapChipsMenuStore {
	selectedChip: string
	selectedEndPoint: BinType | null
	lastChipChangeTimestamp: number
	clearTimeoutId: NodeJS.Timeout | null
	setSelectedChip: (selectedChip: string, endPoint: BinType) => void
	clearChip: () => void
}

export const useMapChipsMenuStore = create<MapChipsMenuStore>((set, get) => ({
	selectedChip: '',
	selectedEndPoint: null,
	lastChipChangeTimestamp: 0,
	clearTimeoutId: null,
	setSelectedChip: (chipId, endPoint) => {
		// Cancelar limpieza pendiente del chip anterior
		const currentTimeoutId = get().clearTimeoutId
		if (currentTimeoutId) {
			clearTimeout(currentTimeoutId)
		}

		// Limpiar bins y clusters del mapa INMEDIATAMENTE de forma síncrona
		// Esto evita race conditions con Mapbox
		const { clearBins } = useMapBinsStore.getState()
		const { clearClusters } = useMapClustersStore.getState()
		const { reset } = useMapBottomSheetStore.getState()

		console.log('🧹 [CHIP_CHANGE] Clearing bins and clusters synchronously')
		clearBins()
		clearClusters()
		reset() // Limpiar bin seleccionado y cerrar bottom sheet

		set({
			selectedChip: chipId,
			selectedEndPoint: endPoint,
			lastChipChangeTimestamp: Date.now(), // Registrar timestamp del cambio
			clearTimeoutId: null,
		})
	},
	clearChip: () => {
		const { deactivateRouteIfActive } = useMapNavigationStore.getState()
		const { reset } = useMapBottomSheetStore.getState()
		const { clearBins } = useMapBinsStore.getState()
		const { clearClusters } = useMapClustersStore.getState()

		deactivateRouteIfActive()

		// Limpiar bins y clusters del mapa
		clearBins()
		clearClusters()

		set({ selectedChip: '', selectedEndPoint: null })
		reset()
	},
}))
