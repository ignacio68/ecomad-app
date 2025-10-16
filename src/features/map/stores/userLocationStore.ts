import {
	LocationOptions,
	UserLocation,
	userLocationService,
} from '@map/services/userLocationService'
import { PermissionStatus } from 'expo-location'
import { create } from 'zustand'

interface UserLocationStore {
	location: UserLocation | null
	isTracking: boolean
	permissionStatus: PermissionStatus
	isLoading: boolean
	isError: boolean
	requestPermissions: () => Promise<PermissionStatus>
	getCurrentLocation: (
		options?: LocationOptions,
	) => Promise<UserLocation | null>
	startTracking: (options?: LocationOptions) => Promise<boolean>
	stopTracking: () => Promise<void>
}

export const useUserLocationStore = create<UserLocationStore>((set, get) => ({
	location: null,
	isTracking: false,
	permissionStatus: PermissionStatus.UNDETERMINED,
	isLoading: false,
	isError: false,

	requestPermissions: async () => {
		try {
			set({ isError: false })
			const status = await userLocationService.requestPermissions()
			set({ permissionStatus: status })
			return status
		} catch (err) {
			set({ isError: true })
			console.error('❌ Error requesting permissions:', err)
			return PermissionStatus.DENIED
		}
	},

	getCurrentLocation: async (options?: LocationOptions) => {
		try {
			set({ isError: false, isLoading: true })
			const currentLocation =
				await userLocationService.getCurrentLocation(options)
			if (currentLocation) {
				set({ location: currentLocation, isLoading: false })
			} else {
				set({ isLoading: false })
			}
			return currentLocation
		} catch (err) {
			set({ isError: true, isLoading: false })
			console.error('❌ Error getting location:', err)
			return null
		}
	},

	startTracking: async (options?: LocationOptions) => {
		try {
			set({ isError: false })

			if (get().isTracking) {
				return true
			}

			const success = await userLocationService.startLocationTracking(
				options,
				newLocation => {
					set({ location: newLocation })
				},
			)

			if (success) {
				set({ isTracking: true })
			}

			return success
		} catch (err) {
			set({ isError: true })
			console.error('❌ Error starting tracking:', err)
			return false
		}
	},

	stopTracking: async () => {
		try {
			set({ isError: false })
			await userLocationService.stopLocationTracking()
			set({ isTracking: false })
		} catch (err) {
			set({ isError: true })
			console.error('❌ Error stopping tracking:', err)
		}
	},
}))

userLocationService
	.checkPermissions()
	.then(status => {
		useUserLocationStore.setState({ permissionStatus: status })
	})
	.catch(err => {
		console.error('❌ Error checking initial permissions:', err)
	})

const lastLocation = userLocationService.getLastKnownLocation()
if (lastLocation) {
	useUserLocationStore.setState({ location: lastLocation })
}
