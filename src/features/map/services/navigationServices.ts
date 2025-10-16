import {
	EXPO_PUBLIC_MAPBOX_DIRECTIONS_URL,
	MAPBOX_DOWNLOADS_TOKEN,
} from '@map/constants/map'
import { LngLat } from '@map/types/mapData'
import { RouteProfile, type RouteResponse } from '@map/types/navigation'
import { fetch } from 'expo/fetch'

export { RouteProfile } from '@map/types/navigation'

export const getRoute = async (
	profile: RouteProfile,
	origin: LngLat,
	destination: LngLat,
): Promise<RouteResponse | null> => {
	try {
		const coords = `${origin[0]},${origin[1]};${destination[0]},${destination[1]}`
		const params = `steps=true&geometries=geojson&overview=full&access_token=${MAPBOX_DOWNLOADS_TOKEN}`
		const url = `${EXPO_PUBLIC_MAPBOX_DIRECTIONS_URL}${profile}/${coords}?${params}`

		const response = await fetch(url)

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const json = await response.json()

		if (json.code !== 'Ok') {
			console.error('❌ Mapbox API error:', json.message || 'Unknown error')
			return null
		}

		if (!json.routes || json.routes.length === 0) {
			console.error('❌ No routes found')
			return null
		}

		const route = json.routes[0]

		return {
			geometry: {
				type: 'Feature',
				properties: {
					distance: route.distance,
					duration: route.duration,
				},
				geometry: route.geometry,
			},
			distance: route.distance,
			duration: route.duration,
			steps: route.legs?.[0]?.steps || [],
			legs: route.legs || [],
		}
	} catch (error) {
		console.error('❌ Error getting route:', error)
		return null
	}
}

export const getWalkingRoute = (origin: LngLat, destination: LngLat) =>
	getRoute(RouteProfile.WALKING, origin, destination)

export const getCyclingRoute = (origin: LngLat, destination: LngLat) =>
	getRoute(RouteProfile.CYCLING, origin, destination)

export const getDrivingRoute = (origin: LngLat, destination: LngLat) =>
	getRoute(RouteProfile.DRIVING, origin, destination)

export const getDrivingTrafficRoute = (origin: LngLat, destination: LngLat) =>
	getRoute(RouteProfile.DRIVING_TRAFFIC, origin, destination)
