import { create } from 'zustand'
import type { BinPoint } from '../hooks/useSuperclusterBins'
import type {
	BottomSheetState,
	ClusterFeature,
	MarkerType,
} from '../types/mapData'

interface MapBottomSheetStore {
	mapBottomSheetTitle: string
	setMapBottomSheetTitle: (title: string) => void
	isMapBottomSheetOpen: boolean
	setIsMapBottomSheetOpen: (isOpen: boolean) => void
	markerState: BottomSheetState
	setMarkerType: (markerType: MarkerType) => void
	setSelectedBin: (bin: BinPoint | null) => void
	setSelectedCluster: (cluster: ClusterFeature | null) => void
	reset: () => void
}

export const useMapBottomSheetStore = create<MapBottomSheetStore>(set => ({
	mapBottomSheetTitle: '',
	setMapBottomSheetTitle: title => set({ mapBottomSheetTitle: title }),
	isMapBottomSheetOpen: false,
	setIsMapBottomSheetOpen: isOpen => set({ isMapBottomSheetOpen: isOpen }),
	markerState: {
		markerType: 'general',
		selectedBin: null,
		selectedCluster: null,
	},
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
				markerType: bin ? 'bin' : state.markerState.markerType,
				selectedCluster: bin ? null : state.markerState.selectedCluster,
			},
		})),
	setSelectedCluster: cluster =>
		set(state => ({
			markerState: {
				...state.markerState,
				selectedCluster: cluster,
				markerType: cluster ? 'cluster' : state.markerState.markerType,
				selectedBin: cluster ? null : state.markerState.selectedBin,
			},
		})),
	reset: () =>
		set(state => ({
			markerState: {
				...state.markerState,
				markerType: 'general',
				selectedBin: null,
				selectedCluster: null,
			},
		})),
}))
