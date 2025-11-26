import type { UserLocation, UpdateStrategy } from '@map/types/userLocation'

export const haversineMeters = (a: UserLocation, b: UserLocation) => {
	const R = 6371000
	const toRad = (deg: number) => (deg * Math.PI) / 180
	const dLat = toRad(b.latitude - a.latitude)
	const dLon = toRad(b.longitude - a.longitude)
	const lat1 = toRad(a.latitude)
	const lat2 = toRad(b.latitude)
	const x =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
	const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
	return R * c
}

export const shouldUpdateLocation = (
	prev: UserLocation | null,
	next: UserLocation,
	strategy: Required<UpdateStrategy>,
	lastAppliedTs?: number,
) => {
	const now = Date.now()
	if (lastAppliedTs && now - lastAppliedTs < strategy.minIntervalMs)
		return false
	if (!prev) return true
	const dist = haversineMeters(prev, next)
	if (dist >= strategy.minDistanceMeters) return true
	const prevHeading = prev.heading ?? 0
	const nextHeading = next.heading ?? 0
	if (Math.abs(prevHeading - nextHeading) >= strategy.minHeadingDelta)
		return true
	return false
}
