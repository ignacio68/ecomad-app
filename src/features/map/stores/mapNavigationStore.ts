import { getRoute } from '@map/services/navigationServices'
import { LngLat } from '@map/types/mapData'
import { RouteData, RouteProfile } from '@map/types/navigation'
import { clearRouteCorridorCache } from '@map/utils/routeUtils'
import { create } from 'zustand'

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
		try {
			set({ isError: false, isLoading: true })

			const routeGeometry = await getRoute(profile, origin, destination)

			if (!routeGeometry) {
				set({ isError: true, isLoading: false, hasActiveRoute: false })
				return null
			}

			const routeData: RouteData = {
				geometry: routeGeometry.geometry,
				distance: routeGeometry.distance,
				duration: routeGeometry.duration,
				steps: routeGeometry.steps,
			}

			set({ route: routeData, isLoading: false, hasActiveRoute: true })
			console.log('🔍 Store: Route saved', {
				distance: routeData.distance,
				duration: routeData.duration,
				geometryType: routeData.geometry.geometry.type,
				coordinatesCount: routeData.geometry.geometry.coordinates.length,
			})
			return routeData
		} catch (err) {
			set({ isError: true, isLoading: false, hasActiveRoute: false })
			console.error('❌ Error calculating route:', err)
			return null
		}
	},
	clearRoute: () => {
		clearRouteCorridorCache()
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
