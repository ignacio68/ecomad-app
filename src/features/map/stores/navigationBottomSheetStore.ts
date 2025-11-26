import { create } from 'zustand'

interface NavigationBottomSheetStore {
	isNavigationBottomSheetOpen: boolean
	setIsNavigationBottomSheetOpen: (isOpen: boolean) => void
}

export const useNavigationBottomSheetStore = create<NavigationBottomSheetStore>(
	set => ({
		isNavigationBottomSheetOpen: false,
		setIsNavigationBottomSheetOpen: isOpen =>
			set({ isNavigationBottomSheetOpen: isOpen }),
	}),
)
