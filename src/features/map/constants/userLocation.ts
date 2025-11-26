import type { UpdateStrategy } from '@map/types/userLocation'

export const DEFAULT_STRATEGY: Required<UpdateStrategy> = {
	minDistanceMeters: 5, // evita “ruido” del GPS
	minIntervalMs: 1000, // 1s entre renders por tracking
	minHeadingDelta: 10, // no repintar si no gira
}
