import { type BinPoint, type BottomSheetState, MarkerType } from '@map/types/mapData'
import { create } from 'zustand'

interface MapBottomSheetStore {
	mapBottomSheetTitle: string
	isMapBottomSheetOpen: boolean
	markerState: BottomSheetState
	// Selectores
	getSelectedBinId: () => string | null
	isBinSelected: (binId: string | number) => boolean
	setMapBottomSheetTitle: (title: string) => void
	setIsMapBottomSheetOpen: (isOpen: boolean) => void
	setMarkerType: (markerType: MarkerType) => void
	setSelectedBin: (bin: BinPoint | null) => void
	reset: () => void
}

export const useMapBottomSheetStore = create<MapBottomSheetStore>((set, get) => ({
	mapBottomSheetTitle: '',
	isMapBottomSheetOpen: false,
	markerState: {
		markerType: MarkerType.GENERAL,
		selectedBin: null,
	},
	getSelectedBinId: () => {
		const selected = get().markerState.selectedBin
		return selected ? String(selected.properties.binId) : null
	},
	isBinSelected: (binId: string | number) => {
		const selectedId = get().getSelectedBinId()
		if (selectedId === null) return false
		return selectedId === String(binId)
	},
	setMapBottomSheetTitle: title => set({ mapBottomSheetTitle: title }),
	setIsMapBottomSheetOpen: isOpen => set({ isMapBottomSheetOpen: isOpen }),
	setMarkerType: markerType =>
		set(state => ({
			markerState: {
				...state.markerState,
				markerType,
			},
		})),
	setSelectedBin: bin =>
		set(state => ({
			markerState: {
				...state.markerState,
				selectedBin: bin,
				markerType: MarkerType.BIN,
			},
		})),
	reset: () =>
		set(state => ({
			markerState: {
				...state.markerState,
				markerType: MarkerType.GENERAL,
				selectedBin: null,
			},
		})),
}))
