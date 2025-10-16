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
	setMapBottomSheetTitle: (title: string) => void
	setIsMapBottomSheetOpen: (isOpen: boolean) => void
	setMarkerType: (markerType: MarkerType) => void
	setSelectedBin: (bin: BinPoint | null) => void
	setSelectedCluster: (cluster: ClusterFeature | null) => void
	reset: () => void
}

export const useMapBottomSheetStore = create<MapBottomSheetStore>(set => ({
	mapBottomSheetTitle: '',
	isMapBottomSheetOpen: false,
	markerState: {
		markerType: MarkerType.GENERAL,
		selectedBin: null,
		selectedCluster: null,
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
				markerType: bin ? MarkerType.BIN : state.markerState.markerType,
				selectedCluster: bin ? null : state.markerState.selectedCluster,
			},
		})),
	setSelectedCluster: cluster =>
		set(state => ({
			markerState: {
				...state.markerState,
				selectedCluster: cluster,
				markerType: cluster ? MarkerType.CLUSTER : state.markerState.markerType,
				selectedBin: cluster ? null : state.markerState.selectedBin,
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
}))
