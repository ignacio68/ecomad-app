import { CENTER_THRESHOLD, ZOOM_THRESHOLD } from '@map/constants/map'
import type { LngLatBounds } from '../types/mapData'

export const hasSignificantZoomChange = (prev: number | null, next: number) =>
	prev == null || Math.abs((prev ?? 0) - next) >= ZOOM_THRESHOLD

export const hasSignificantCenterChange = (
	prev: { lat: number; lng: number } | null,
	next: { lat: number; lng: number },
) =>
	!prev ||
	Math.abs((prev?.lat ?? 0) - next.lat) >= CENTER_THRESHOLD ||
	Math.abs((prev?.lng ?? 0) - next.lng) >= CENTER_THRESHOLD

export const hasSignificantBoundsChange = (
	prev: LngLatBounds | null,
	next: LngLatBounds,
) =>
	!prev ||
	Math.abs(prev[0][0] - next[0][0]) >= CENTER_THRESHOLD ||
	Math.abs(prev[0][1] - next[0][1]) >= CENTER_THRESHOLD ||
	Math.abs(prev[1][0] - next[1][0]) >= CENTER_THRESHOLD ||
	Math.abs(prev[1][1] - next[1][1]) >= CENTER_THRESHOLD
