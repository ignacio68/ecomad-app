import { create } from 'zustand'

interface MapBottomSheetStore {
	mapBottomSheetTitle: string
	setMapBottomSheetTitle: (title: string) => void
	isMapBottomSheetOpen: boolean
	setIsMapBottomSheetOpen: (isOpen: boolean) => void
}

export const useMapBottomSheetStore = create<MapBottomSheetStore>(set => ({
	mapBottomSheetTitle: '',
	setMapBottomSheetTitle: title => set({ mapBottomSheetTitle: title }),
	isMapBottomSheetOpen: false,
	setIsMapBottomSheetOpen: isOpen => {
		set({ isMapBottomSheetOpen: isOpen })
	},
}))


