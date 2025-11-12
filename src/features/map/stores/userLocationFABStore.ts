import { create } from 'zustand'
import { useMapNavigationStore } from './mapNavigationStore'

interface UserLocationFABStore {
	isUserLocationFABActivated: boolean
	isManuallyActivated: boolean
	isMapStylesFABActivated: boolean

	activateUserLocation: (opts?: { manual?: boolean }) => void
	deactivateUserLocation: (opts?: { keepRoute?: boolean }) => void
	setIsUserLocationFABActivated: (
		active: boolean,
		opts?: { manual?: boolean },
	) => void
	setIsManuallyActivated: (manual: boolean) => void

	setIsMapStylesFABActivated: (active: boolean) => void
	// setIsUserLocationFABActivated: (active: boolean) => void
	// setIsManuallyActivated: (manual: boolean) => void
}

export const useUserLocationFABStore = create<UserLocationFABStore>(
	(set, get) => ({
		isUserLocationFABActivated: false,
		isManuallyActivated: false,
		isMapStylesFABActivated: false,

		activateUserLocation: ({ manual = true } = {}) => {
			if (get().isUserLocationFABActivated) return
			set({ isUserLocationFABActivated: true, isManuallyActivated: manual })
		},

		deactivateUserLocation: ({ keepRoute = false } = {}) => {
			if (!get().isUserLocationFABActivated) return

			// Lógica de navegación al desactivar la localización
			// Solo desactivar ruta si keepRoute es false (comportamiento por defecto)
			if (!keepRoute) {
				const { deactivateRouteIfActive } = useMapNavigationStore.getState()
				deactivateRouteIfActive()
			}

			set({ isUserLocationFABActivated: false, isManuallyActivated: false })
		},

		setIsUserLocationFABActivated: active => {
			if (!active) {
				const { deactivateRouteIfActive } = useMapNavigationStore.getState()
				deactivateRouteIfActive()
				// Limpiar el flag manual al desactivar
				set({
					isUserLocationFABActivated: false,
					isManuallyActivated: false,
				})
				return
			}
			set({ isUserLocationFABActivated: true })
		},

		setIsManuallyActivated: manual => set({ isManuallyActivated: manual }),

		setIsMapStylesFABActivated: active => {
			set({ isMapStylesFABActivated: active })
		},
	}),
)
