import { create } from 'zustand'
import { useMapNavigationStore } from './mapNavigationStore'

interface UserLocationFABStore {
	isUserLocationFABActivated: boolean
	isManuallyActivated: boolean
	isMapStylesFABActivated: boolean,
	setIsMapStylesFABActivate: (isMapStylesActivated: boolean) => void
	setIsUserLocationFABActivated: (isUserLocationctivated: boolean) => void
	toggleUserLocationFAB: () => void
	setIsManuallyActivated: (manual: boolean) => void
}

export const useUserLocationFABStore = create<UserLocationFABStore>(set => ({
	isUserLocationFABActivated: false,
	isManuallyActivated: false,
	isMapStylesFABActivated: false,
	setIsMapStylesFABActivate: isMapStylesActivated => {
		set({ isMapStylesFABActivated: isMapStylesActivated })
	},
	setIsUserLocationFABActivated: isUserLocationActivated => {
		if (!isUserLocationActivated) {
			const { deactivateRouteIfActive } = useMapNavigationStore.getState()
			deactivateRouteIfActive()
			// Limpiar el flag manual al desactivar
			set({
				isUserLocationFABActivated: isUserLocationActivated,
				isManuallyActivated: false,
			})
			return
		}
		set({ isUserLocationFABActivated: isUserLocationActivated })
	},
	toggleUserLocationFAB: () => {
		const currentState = useUserLocationFABStore.getState()
		const willBeActivated = !currentState.isUserLocationFABActivated

		if (!willBeActivated) {
			const { deactivateRouteIfActive } = useMapNavigationStore.getState()
			deactivateRouteIfActive()
		}

		// Cuando se activa manualmente con el FAB, marcar como manual
		set(state => ({
			isUserLocationFABActivated: !state.isUserLocationFABActivated,
			isManuallyActivated: !state.isUserLocationFABActivated, // true si se activa, false si se desactiva
		}))
	},
	setIsManuallyActivated: manual => set({ isManuallyActivated: manual }),
}))
