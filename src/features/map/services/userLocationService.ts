// src/hooks/useLocationSelectors.ts
import { useLocationStore } from '../stores/userLocationStore'

export const useCurrentLocation = () => useLocationStore(s => s.location)

export const useLocationStatus = () =>
	useLocationStore(s => ({ isRunning: s.isRunning, error: s.error }))

export const useSetPermissions = () =>
	useLocationStore(s => s.setPermissions)

export const useLocationControls = () =>
	useLocationStore(s => ({
		startWatching: s.startWatching,
		stopWatching: s.stopWatching,
		setOptions: s.setOptions,
		getCurrentPosition: s.getCurrentPosition,
	}))