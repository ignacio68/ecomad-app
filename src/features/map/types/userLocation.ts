import type { LocationAccuracy } from 'expo-location'

export interface UserLocation {
	latitude: number
	longitude: number
	accuracy?: number
	heading?: number
	speed?: number
	timestamp: number
}

export interface UpdateStrategy {
	minDistanceMeters?: number
	minIntervalMs?: number
	minHeadingDelta?: number
}

export interface LocationOptions {
	accuracy?: LocationAccuracy
	timeInterval?: number
	distanceInterval?: number
}
