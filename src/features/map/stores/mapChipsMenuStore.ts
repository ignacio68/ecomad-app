import { create } from 'zustand'

interface MapChipsMenuStore {
	selectedChip: string
	setSelectedChip: (selectedChip: string) => void
	clearChip: () => void
}

export const useMapChipsMenuStore = create<MapChipsMenuStore>(set => ({
	selectedChip: '',
	setSelectedChip: chipId => set({ selectedChip: chipId }),
	clearChip: () => set({ selectedChip: '' }),
}))
