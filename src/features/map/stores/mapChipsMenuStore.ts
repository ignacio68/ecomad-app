import type { BinType } from '@/shared/types/bins'
import { create } from 'zustand'
import { useMapNavigationStore } from './mapNavigationStore'

interface MapChipsMenuStore {
	selectedChip: string
	selectedEndPoint: BinType | null
	setSelectedChip: (selectedChip: string, endPoint: BinType) => void
	clearChip: () => void
}

export const useMapChipsMenuStore = create<MapChipsMenuStore>(set => ({
	selectedChip: '',
	selectedEndPoint: null,
	setSelectedChip: (chipId, endPoint) =>
		set({ selectedChip: chipId, selectedEndPoint: endPoint }),
	clearChip: () => {
		const { deactivateRouteIfActive } = useMapNavigationStore.getState()
		deactivateRouteIfActive()
		set({ selectedChip: '', selectedEndPoint: null })
	},
}))
