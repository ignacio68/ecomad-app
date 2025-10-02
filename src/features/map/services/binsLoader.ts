import { BinsService } from '@/db/bins/service'
import { BinType } from '@/shared/types/bins'
import {
	HIGH_ZOOM_THRESHOLD,
	LOAD_POINTS_TIMEOUT_MS,
	MAX_VISIBLE_POINTS_HIGH_ZOOM,
	MAX_VISIBLE_POINTS_LOW_ZOOM,
	VIEWPORT_BUFFER,
} from '../constants/clustering'
import { INITIAL_BOUNDS } from '../constants/map'
import { BinPoint, type LngLatBounds } from '../types/mapData'
import { convertContainersToGeoJSON } from '../utils/geoUtils'

/**
 * Cache interface for bins data
 */
export interface BinsCache {
	get: (key: BinType) => BinPoint[] | null
	set: (key: BinType, value: BinPoint[]) => void
	clear: (key?: BinType) => void
}

/**
 * Load containers as GeoJSON points with cache support
 * Pure function that handles loading and converting bin containers
 */
export const loadContainersAsGeoJSON = async (
	binType: BinType,
	cache: BinsCache,
): Promise<BinPoint[]> => {
	console.log(`🔄 loadContainersAsGeoJSON called for ${binType}`)

	try {
		// Verificar cache primero
		const cachedPoints = cache.get(binType)
		if (cachedPoints) {
			console.log(`✅ Cache hit for ${binType}: ${cachedPoints.length} points`)

			// Verificar si hay duplicados en el cache
			const containerIds = cachedPoints.map(p => p.properties.containerId)
			const uniqueIds = new Set(containerIds)

			if (containerIds.length !== uniqueIds.size) {
				console.warn(
					`⚠️ Found duplicates in cache for ${binType}, clearing cache`,
				)
				cache.clear(binType)
				// Continuar con carga desde base de datos
			} else {
				return cachedPoints
			}
		}

		console.log(`📥 Cache miss for ${binType}, loading containers...`)

		// Obtener contenedores directamente
		const containers = await BinsService.getContainersData(binType)

		if (!containers || containers.length === 0) {
			return []
		}

		// Usar la función pura para convertir a GeoJSON
		const points = convertContainersToGeoJSON(containers, binType)
		console.log(
			`✅ Converted ${containers.length} containers → ${points.length} GeoJSON points for ${binType}`,
		)

		// Guardar en cache
		cache.set(binType, points)
		return points
	} catch (error) {
		console.error(`❌ Error loading containers for ${binType}:`, error)
		return []
	}
}

/**
 * Load containers with timeout protection
 * Pure function that wraps loadContainersAsGeoJSON with timeout
 */
export const loadContainersWithTimeout = async (
	binType: BinType,
	cache: BinsCache,
	timeoutMs: number = LOAD_POINTS_TIMEOUT_MS,
): Promise<BinPoint[]> => {
	return new Promise((resolve, reject) => {
		const timeoutId = setTimeout(() => {
			console.warn('⚠️ Timeout: Load points taking too long, aborting')
			reject(new Error('Timeout loading points'))
		}, timeoutMs)

		loadContainersAsGeoJSON(binType, cache)
			.then(points => {
				clearTimeout(timeoutId)
				resolve(points)
			})
			.catch(error => {
				clearTimeout(timeoutId)
				reject(error)
			})
	})
}

/**
 * Clear bins cache
 * Pure function to clear cache
 */
export const clearBinsCache = (cache: BinsCache): void => {
	cache.clear()
}

/**
 * Validate bounds before processing
 * Pure function to validate viewport bounds
 */
export const isValidBounds = (bounds: LngLatBounds | null): boolean => {
	if (!bounds) return false
	const [[minLng, minLat], [maxLng, maxLat]] = bounds
	return (
		!isNaN(minLng) &&
		!isNaN(minLat) &&
		!isNaN(maxLng) &&
		!isNaN(maxLat) &&
		minLng < maxLng &&
		minLat < maxLat &&
		minLng >= -180 &&
		maxLng <= 180 && // Longitud válida
		minLat >= -90 &&
		maxLat <= 90 // Latitud válida
	)
}

/**
 * Calculate distance between two points
 * Pure function to calculate euclidean distance
 */
export const calculateDistance = (
	point1: [number, number],
	point2: [number, number],
): number => {
	const [lng1, lat1] = point1
	const [lng2, lat2] = point2
	const deltaLng = lng2 - lng1
	const deltaLat = lat2 - lat1
	return Math.sqrt(deltaLng * deltaLng + deltaLat * deltaLat)
}

/**
 * Sort points by distance to center and limit to max points
 * Pure function to optimize point selection
 */
export const sortPointsByDistance = (
	points: BinPoint[],
	center: { lng: number; lat: number },
	maxPoints: number,
): BinPoint[] => {
	const centerCoords: [number, number] = [center.lng, center.lat]

	return points
		.map(point => ({
			...point,
			distance: calculateDistance(point.geometry.coordinates, centerCoords),
		}))
		.sort((a, b) => a.distance - b.distance)
		.slice(0, maxPoints)
		.map(({ distance, ...point }) => point) // Remover distance del resultado
}

/**
 * Wait for stable zoom value
 * Prevents filtering with intermediate zoom values
 */
const waitForStableZoom = async (
	zoom: number | null,
	timeoutMs: number = 200,
): Promise<number> => {
	return new Promise(resolve => {
		if (zoom !== null && !isNaN(zoom)) {
			// Zoom válido, resolver inmediatamente
			resolve(zoom)
		} else {
			resolve(zoom || 11)
		}
	})
}

/**
 * Wait for valid bounds
 * Prevents filtering with invalid or null bounds
 */
const waitForValidBounds = async (
	bounds: LngLatBounds | null,
	timeoutMs: number = 200,
): Promise<LngLatBounds> => {
	return new Promise(resolve => {
		if (isValidBounds(bounds)) {
			// Verificar si los bounds son de Europa (muy amplios)
			const [[minLng, minLat], [maxLng, maxLat]] = bounds!
			const lngRange = maxLng - minLng
			const latRange = maxLat - minLat

			// Si los bounds son muy amplios (Europa), usar bounds iniciales por defecto
			if (lngRange > 10 || latRange > 10) {
				console.log(`🔍 Bounds too wide (Europe):`, bounds)
				console.log(`🔍 Using INITIAL_BOUNDS instead`)
				resolve(INITIAL_BOUNDS)
			} else {
				console.log(`🔍 Using provided valid bounds:`, bounds)
				resolve(bounds!)
			}
		} else {
			// Si siguen siendo inválidos, usar bounds iniciales por defecto
			console.log(`🔍 Invalid bounds provided:`, bounds)
			console.log(`🔍 Using INITIAL_BOUNDS`)
			resolve(INITIAL_BOUNDS)
		}
	})
}

/**
 * Async pipeline for filtering points
 * Ensures all parameters are ready before filtering
 */
export const filterPointsAsync = async (
	points: BinPoint[],
	zoom: number | null,
	bounds: LngLatBounds | null,
	center: { lng: number; lat: number } | null,
): Promise<BinPoint[]> => {
	if (__DEV__) {
		console.log(`🔄 Starting async filtering pipeline`)
	}

	try {
		const stableZoom = await waitForStableZoom(zoom)
		if (__DEV__) {
			console.log(`✅ Step 1: Got stable zoom ${stableZoom}`)
		}

		const validBounds = await waitForValidBounds(bounds)
		if (__DEV__) {
			console.log(`✅ Step 2: Got valid bounds`)
		}

		const filtered = await filterPointsForViewport(
			points,
			stableZoom,
			validBounds,
			center,
		)
		if (__DEV__) {
			console.log(
				`✅ Step 3: Filtered ${points.length} → ${filtered.length} points`,
			)
		}

		return filtered
	} catch (error) {
		console.error(`❌ Error in async filtering pipeline:`, error)
		console.error(
			`❌ Error stack:`,
			error instanceof Error ? error.stack : 'No stack',
		)
		return []
	}
}

/**
 * Validate bounds asynchronously
 * Step 1: Wait for valid bounds
 */
const validateBoundsAsync = async (
	bounds: LngLatBounds | null,
	center: { lng: number; lat: number } | null,
	zoom: number,
): Promise<{
	isValid: boolean
	bounds: LngLatBounds | null
	center: { lng: number; lat: number } | null
}> => {
	// Validación inmediata, sin setTimeout
	if (isValidBounds(bounds)) {
		return { isValid: true, bounds, center }
	} else {
		console.log(`🔍 Invalid bounds, will filter by center + radius`)
		return { isValid: false, bounds: null, center }
	}
}

/**
 * Filter by bounds asynchronously
 * Step 2: Filter points within viewport bounds
 */
const filterByBoundsAsync = async (
	points: BinPoint[],
	bounds: LngLatBounds,
	zoom: number,
): Promise<BinPoint[]> => {
	// Filtrado inmediato, sin setTimeout
	const [[minLng, minLat], [maxLng, maxLat]] = bounds
	const buffer = VIEWPORT_BUFFER
	const expandedMinLng = minLng - buffer
	const expandedMinLat = minLat - buffer
	const expandedMaxLng = maxLng + buffer
	const expandedMaxLat = maxLat + buffer

	if (__DEV__) {
		console.log(`🔍 Filtering at zoom ${zoom}`)
	}

	const filteredWithinBounds = points.filter(point => {
		const [lng, lat] = point.geometry.coordinates
		return (
			lng >= expandedMinLng &&
			lng <= expandedMaxLng &&
			lat >= expandedMinLat &&
			lat <= expandedMaxLat
		)
	})

	return filteredWithinBounds
}

/**
 * Filter by center + radius asynchronously
 * Step 2 alternative: Filter points by distance from center
 */
const filterByRadiusAsync = async (
	points: BinPoint[],
	center: { lng: number; lat: number },
	zoom: number,
): Promise<BinPoint[]> => {
	// Filtrado inmediato, sin setTimeout
	// Radio dinámico según zoom: más pequeño en zoom alto, más grande en zoom bajo
	const radius = zoom > HIGH_ZOOM_THRESHOLD ? 0.01 : 0.05
	const centerCoords: [number, number] = [center.lng, center.lat]

	const filteredByRadius = points.filter(
		point =>
			calculateDistance(point.geometry.coordinates, centerCoords) <= radius,
	)

	console.log(
		`🔍 Filtered by radius ${radius}: ${points.length} → ${filteredByRadius.length} points`,
	)
	return filteredByRadius
}

/**
 * Limit points by distance asynchronously
 * Step 3: Limit to max visible points by distance from center
 */
const limitByDistanceAsync = async (
	points: BinPoint[],
	center: { lng: number; lat: number },
	zoom: number,
): Promise<BinPoint[]> => {
	// Limitación inmediata, sin setTimeout
	// Limitar puntos visibles para mejorar performance
	const MAX_VISIBLE_POINTS =
		zoom > HIGH_ZOOM_THRESHOLD
			? MAX_VISIBLE_POINTS_HIGH_ZOOM
			: MAX_VISIBLE_POINTS_LOW_ZOOM

	if (points.length > MAX_VISIBLE_POINTS) {
		// Ordenar por distancia al centro del viewport (más inteligente)
		const sortedPoints = sortPointsByDistance(
			points,
			center,
			MAX_VISIBLE_POINTS,
		)

		if (__DEV__) {
			console.log(
				`🔍 Limited points by distance: ${points.length} → ${sortedPoints.length} (zoom: ${zoom})`,
			)
		}

		return sortedPoints
	} else {
		return points
	}
}

/**
 * Filter points by viewport bounds and optimize for performance
 * Async function that handles all filtering logic step by step
 */
export const filterPointsForViewport = async (
	points: BinPoint[],
	zoom: number,
	bounds: LngLatBounds | null,
	center: { lng: number; lat: number } | null,
): Promise<BinPoint[]> => {
	// Step 1: Validate bounds asynchronously
	const {
		isValid,
		bounds: validBounds,
		center: validCenter,
	} = await validateBoundsAsync(bounds, center, zoom)

	let filteredPoints: BinPoint[]

	if (isValid && validBounds) {
		// Step 2: Filter by bounds
		filteredPoints = await filterByBoundsAsync(points, validBounds, zoom)
	} else if (validCenter) {
		// Step 2 alternative: Filter by center + radius
		filteredPoints = await filterByRadiusAsync(points, validCenter, zoom)
	} else {
		console.log(`🔍 No center available, returning empty array`)
		return []
	}

	// Step 3: Limit by distance if needed
	if (validCenter) {
		filteredPoints = await limitByDistanceAsync(
			filteredPoints,
			validCenter,
			zoom,
		)
	}

	// Log solo cuando hay reducción significativa de puntos
	if (__DEV__ && filteredPoints.length < points.length * 0.8) {
		console.log(
			`🔍 Final filtered ${points.length} → ${filteredPoints.length} points (zoom: ${zoom})`,
		)
	}

	return filteredPoints
}
