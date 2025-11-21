import {
	type BinPoint,
	type BottomSheetState,
	type ClusterFeature,
	MarkerType,
} from '@map/types/mapData'
import { create } from 'zustand'

interface MapBottomSheetStore {
	mapBottomSheetTitle: string
	isMapBottomSheetOpen: boolean
	markerState: BottomSheetState
	// Selectores
	getSelectedBinId: () => string | null
	isBinSelected: (containerId: string | number) => boolean
	setMapBottomSheetTitle: (title: string) => void
	setIsMapBottomSheetOpen: (isOpen: boolean) => void
	setMarkerType: (markerType: MarkerType) => void
	setSelectedBin: (bin: BinPoint | null) => void
	setSelectedCluster: (cluster: ClusterFeature | null) => void
	reset: () => void
}

export const useMapBottomSheetStore = create<MapBottomSheetStore>(
	(set, get) => ({
		mapBottomSheetTitle: '',
		isMapBottomSheetOpen: false,
		markerState: {
			markerType: MarkerType.GENERAL,
			selectedBin: null,
			selectedCluster: null,
		},
		getSelectedBinId: () => {
			const selected = get().markerState.selectedBin
			return selected ? String(selected.properties.containerId) : null
		},
		isBinSelected: (containerId: string | number) => {
			const selectedId = get().getSelectedBinId()
			if (selectedId === null) return false
			return selectedId === String(containerId)
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
					markerType: MarkerType.BIN ,
					selectedCluster:  null
				},
			})),
		setSelectedCluster: cluster =>
			set(state => ({
				markerState: {
					...state.markerState,
					selectedCluster: cluster,
					markerType: MarkerType.CLUSTER,
					selectedBin: null ,
				},
			})),
		reset: () =>
			set(state => ({
				markerState: {
					markerType: MarkerType.GENERAL,
					selectedBin: null,
					selectedCluster: null,
				},
			})),
	}),
)
