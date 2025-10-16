import { create } from 'zustand'
import { useMapNavigationStore } from './mapNavigationStore'

interface UserLocationFABStore {
	isUserLocationFABActivated: boolean
	isManuallyActivated: boolean
	setIsUserLocationFABActivated: (activated: boolean) => void
	toggleUserLocationFAB: () => void
	setIsManuallyActivated: (manual: boolean) => void
}

export const useUserLocationFABStore = create<UserLocationFABStore>(set => ({
	isUserLocationFABActivated: false,
	isManuallyActivated: false,
	setIsUserLocationFABActivated: activated => {
		if (!activated) {
			const { deactivateRouteIfActive } = useMapNavigationStore.getState()
			deactivateRouteIfActive()
			// Limpiar el flag manual al desactivar
			set({ isUserLocationFABActivated: activated, isManuallyActivated: false })
		} else {
			set({ isUserLocationFABActivated: activated })
		}
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
