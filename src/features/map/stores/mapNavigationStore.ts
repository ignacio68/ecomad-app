import { getRoute } from '@map/services/navigationServices'
import { LngLat } from '@map/types/mapData'
import { RouteData, RouteProfile } from '@map/types/navigation'
import { clearRouteCorridorCache } from '@map/utils/routeUtils'
import { create } from 'zustand'
import { randomUUID } from 'expo-crypto'

interface MapNavigationStore {
	route: RouteData | null
	hasActiveRoute: boolean
	isLoading: boolean
	isError: boolean
	calculateRoute: (
		origin: LngLat,
		destination: LngLat,
		profile?: RouteProfile,
	) => Promise<RouteData | null>
	clearRoute: () => void
	deactivateRouteIfActive: () => void
	setNavigationMode: (active: boolean) => void
}

export const useMapNavigationStore = create<MapNavigationStore>(set => ({
	route: null,
	hasActiveRoute: false,
	isLoading: false,
	isError: false,
	calculateRoute: async (
		origin,
		destination,
		profile = RouteProfile.WALKING,
	) => {
		console.log('🚀 [ROUTE] Starting route calculation...')
		set({ isLoading: true })
		try {
			const routeGeometry = await getRoute(profile, origin, destination)

			if (!routeGeometry) {
				console.log('❌ [ROUTE] No route found')
				set({ isError: true, isLoading: false, hasActiveRoute: false })
				return null
			}

			const id = randomUUID()

			const routeData: RouteData = {
				id,
				profile,
				geometry: routeGeometry.geometry,
				distance: routeGeometry.distance,
				duration: routeGeometry.duration,
				steps: routeGeometry.steps,
				legs: routeGeometry.legs,
			}

			console.log('✅ [ROUTE] Route calculated successfully', {
				distance: routeData.distance,
				duration: routeData.duration,
				geometryType: routeData.geometry.geometry.type,
				coordinatesCount: routeData.geometry.geometry.coordinates.length,
			})

			set({
				route: routeData,
				isLoading: false,
				hasActiveRoute: true,
			})

			return routeData
		} catch (err) {
			console.error('❌ [ROUTE] Error calculating route:', err)
			set({ isError: true, isLoading: false, hasActiveRoute: false })
			return null
		}
	},
	clearRoute: () => {
		clearRouteCorridorCache()
		console.log('✅ [ROUTE] Clearing route')
		set({
			route: null,
			isError: false,
			isLoading: false,
			hasActiveRoute: false,
		})
	},
	deactivateRouteIfActive: () => {
		const state = useMapNavigationStore.getState()
		if (state.hasActiveRoute) {
			clearRouteCorridorCache()
			console.log('✅ [ROUTE] Deactivating route')
			set({
				route: null,
				isError: false,
				isLoading: false,
				hasActiveRoute: false,
			})
		}
	},
	setNavigationMode: active => {
		set({ hasActiveRoute: active })
	},
}))
