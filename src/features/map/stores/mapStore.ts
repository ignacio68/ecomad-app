import { create } from 'zustand'

interface MapStore {
	isUserLocationFABActivated: boolean
	setIsUserLocationFABActivated: (isPressed: boolean) => void
}

export const useMapStore = create<MapStore>(set => ({
	isUserLocationFABActivated: false,
	setIsUserLocationFABActivated: isPressed =>
		set({ isUserLocationFABActivated: isPressed }),
}))
