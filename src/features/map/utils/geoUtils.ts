import type { BinsContainersCacheRecord } from '@/db/bins/schema'
import type { BinType } from '@/shared/types/bins'
import {
	COORDINATE_PRECISION,
	MOVEMENT_THRESHOLD_ZOOM_10,
	MOVEMENT_THRESHOLD_ZOOM_12,
	MOVEMENT_THRESHOLD_ZOOM_14,
	MOVEMENT_THRESHOLD_ZOOM_16,
	MOVEMENT_THRESHOLD_ZOOM_18,
	MOVEMENT_THRESHOLD_ZOOM_EXTREME,
} from '@map/constants/geolocation'
import {
	CHUNK_SIZE,
	DEFAULT_NEIGHBORHOOD,
	MAX_VISIBLE_POINTS_LOW_ZOOM,
} from '@map/constants/markers'
import {
	type BinPoint,
	type LngLatBounds,
	MapZoomLevels,
} from '@map/types/mapData'
import { area, bboxPolygon, distance, point, type Units } from '@turf/turf'
import { degreesToRadians } from '@turf/helpers'
import { expandBoundsWithBuffer } from '../services/mapService'

export interface Point {
	lat: number
	lng: number
}

type NeighborhoodGroup = {
	code: string
	bins: BinPoint[]
	center: { lat: number; lng: number }
	angle: number
}

/**
 * Calcula la distancia entre dos puntos en metros usando Turf.js
 * @param point1 - Primer punto {lat, lng}
 * @param point2 - Segundo punto {lat, lng}
 * @returns Distancia en metros
 */
export const calculateDistance = (
	point1: Point,
	point2: Point,
	units: Units = 'meters',
): number => {
	const from = point([point1.lng, point1.lat])
	const to = point([point2.lng, point2.lat])
	return distance(from, to, { units })
}

/**
 * Obtiene el umbral de movimiento mínimo según el zoom
 * @param zoom - Nivel de zoom
 * @returns Distancia mínima en metros
 */
export const getMovementThreshold = (zoom: number): number => {
	if (zoom <= 10) return MOVEMENT_THRESHOLD_ZOOM_10
	if (zoom <= 12) return MOVEMENT_THRESHOLD_ZOOM_12
	if (zoom <= 14) return MOVEMENT_THRESHOLD_ZOOM_14
	if (zoom <= 16) return MOVEMENT_THRESHOLD_ZOOM_16
	if (zoom <= 18) return MOVEMENT_THRESHOLD_ZOOM_18
	return MOVEMENT_THRESHOLD_ZOOM_EXTREME
}

/**
 * Verifica si el movimiento es significativo basado en umbrales por zoom
 * @param oldCoords - Coordenadas anteriores
 * @param newCoords - Coordenadas nuevas
 * @param zoom - Nivel de zoom actual
 * @returns true si el movimiento es significativo
 */
export const hasSignificantMovement = (
	oldCoords: Point,
	newCoords: Point,
	zoom: number,
): boolean => {
	const distance = calculateDistance(oldCoords, newCoords)
	const threshold = getMovementThreshold(zoom)
	return distance > threshold
}

/**
 * Genera una clave de cache basada en coordenadas y radio
 * @param binType - Tipo de contenedor
 * @param coords - Coordenadas {lat, lng}
 * @param radius - Radio en km
 * @returns Clave de cache única
 */
export const generateCacheKey = (
	binType: string,
	coords: { lat: number; lng: number },
	radius: number,
): string => {
	// Redondear coordenadas a precisión definida (~100m de precisión)
	const roundedLat =
		Math.round(coords.lat * COORDINATE_PRECISION) / COORDINATE_PRECISION
	const roundedLng =
		Math.round(coords.lng * COORDINATE_PRECISION) / COORDINATE_PRECISION
	return `bins-${binType}-${roundedLat}-${roundedLng}-${radius}`
}

/**
 * Convierte contenedores a formato GeoJSON (función pura)
 * @param bins - Array de contenedores de la base de datos
 * @param binType - Tipo de contenedor
 * @returns Array de puntos en formato GeoJSON
 */
const convertBinRecord = (
	bin: BinsContainersCacheRecord,
	binType: BinType,
): BinPoint | null => {
	const lat = Number(bin.lat)
	const lng = Number(bin.lng)

	if (Number.isNaN(lat) || Number.isNaN(lng)) {
		return null
	}

	const binId = `bin-${bin.binId}`

	return {
		type: 'Feature',
		properties: {
			cluster: false,
			binType,
			binId,
			category_group_id: bin.category_group_id,
			category_id: bin.category_id,
			district_code: bin.district_code,
			neighborhood_code: bin.neighborhood_code,
			address: bin.address,
			lat,
			lng,
			load_type: bin.load_type,
			direction: bin.direction,
			subtype: bin.subtype,
			placement_type: bin.placement_type,
			notes: bin.notes,
			bus_stop: bin.bus_stop,
			interurban_node: bin.interurban_node,
		},
		geometry: {
			type: 'Point',
			coordinates: [lng, lat],
		},
	}
}

export const convertContainersToGeoJSON = (
	bins: BinsContainersCacheRecord[],
	binType: BinType,
): BinPoint[] => {
	if (!bins || bins.length === 0) {
		return []
	}

	const points: BinPoint[] = []

	for (const bin of bins) {
		const feature = convertBinRecord(bin, binType)
		if (feature) {
			points.push(feature)
		}
	}

	return points
}

const flushChunk = (
	chunk: BinPoint[],
	accumulator: BinPoint[],
	onChunk?: (processed: number, total: number) => void,
	total = 0,
) => {
	accumulator.push(...chunk)
	onChunk?.(accumulator.length, total)
}

export const convertContainersToGeoJSONChunked = async (
	bins: BinsContainersCacheRecord[],
	binType: BinType,
	onChunk?: (processed: number, total: number) => void,
): Promise<BinPoint[]> => {
	const total = bins.length
	if (total === 0) return []

	const accumulator: BinPoint[] = []

	for (let i = 0; i < bins.length; i += CHUNK_SIZE) {
		const chunk = bins.slice(i, i + CHUNK_SIZE)
		const convertedChunk: BinPoint[] = []

		for (const bin of chunk) {
			const feature = convertBinRecord(bin, binType)
			if (feature) {
				convertedChunk.push(feature)
			}
		}

		flushChunk(convertedChunk, accumulator, onChunk, total)

		if (i + CHUNK_SIZE < bins.length) {
			await new Promise(resolve => setTimeout(resolve, 0))
		}
	}

	return accumulator
}

export const getCurrentBoundsArea = (currentBounds: LngLatBounds): number => {
	const poly = bboxPolygon([
		currentBounds[0][0],
		currentBounds[0][1],
		currentBounds[1][0],
		currentBounds[1][1],
	])
	return area(poly)
}

// export const getBinsNearby = (targetPoint: Point, points: BinPoint[]): BinPoint[] =>
// 	nearestPoint(targetPoint, points)
export const haversineMeters = (
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
) => {
	const EARTH_RADIUS = 6371000
	const dLat = degreesToRadians(lat2 - lat1)
	const dLon = degreesToRadians(lon2 - lon1)
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(degreesToRadians(lat1)) *
			Math.cos(degreesToRadians(lat2)) *
			Math.sin(dLon / 2) ** 2
	const haversine = 2 * EARTH_RADIUS * Math.asin(Math.sqrt(a))
	return haversine
}

/**
 * Calcula radio dinámico necesario para cubrir el viewport completo
 * @param bounds - Límites del viewport
 * @returns Radio en kilómetros (entre 0.5 y 10km)
 */
export const calculateDynamicRadius = (bounds: LngLatBounds): number => {
	const [[minLng, minLat], [maxLng, maxLat]] = bounds

	// Calcular dimensiones del bounds
	const lngDiff = Math.abs(maxLng - minLng)
	const latDiff = Math.abs(maxLat - minLat)

	// Convertir a km (1 grado ≈ 111 km)
	const centerLat = (minLat + maxLat) / 2
	const widthKm = lngDiff * 111 * Math.cos((centerLat * Math.PI) / 180)
	const heightKm = latDiff * 111

	// Radio = mitad de la diagonal + buffer del 50%
	const diagonalKm = Math.hypot(widthKm, heightKm)
	const radius = (diagonalKm / 2) * 1.5

	// Limitar entre 0.5km y 10km
	return Math.max(0.5, Math.min(10, radius))
}

/**
 * Calcula el centro geográfico de un conjunto de bins
 */
export const calculateNeighborhoodCenter = (
	bins: BinPoint[],
): { lat: number; lng: number } => {
	if (bins.length === 0) return { lat: 0, lng: 0 }

	const sum = bins.reduce(
		(acc, bin) => {
			const [lng, lat] = bin.geometry.coordinates
			return { lat: acc.lat + lat, lng: acc.lng + lng }
		},
		{ lat: 0, lng: 0 },
	)

	return {
		lat: sum.lat / bins.length,
		lng: sum.lng / bins.length,
	}
}

/**
 * Calcula límite de bins según área y densidad objetivo
 * @param bounds - Límites del viewport
 * @param zoom - Nivel de zoom
 * @returns Límite de bins (entre 100 y 1000)
 */
export const calculateLimit = (bounds: LngLatBounds, zoom: number): number => {
	const areaM2 = getCurrentBoundsArea(bounds)
	const areaKm2 = areaM2 / 1_000_000
	const targetDensity = getTargetDensity(zoom)
	const neededBins = Math.ceil(areaKm2 * targetDensity)

	// Limitar entre 100 y 1000 (límite del backend)
	// Multiplicar por 2 para tener margen antes del muestreo
	return Math.max(100, Math.min(1000, neededBins * 2))
}

/**
 * Calcula densidad objetivo de bins según zoom (bins por km²)
 * Valores más restrictivos para forzar al usuario a acercarse
 */
export const getTargetDensity = (zoom: number): number => {
	if (zoom >= 14) return Infinity // Mostrar todos en zoom alto
	if (zoom >= 13) return 150 // ~150 bins/km² en zoom 13
	if (zoom >= 12) return 80 // ~80 bins/km² en zoom 12
	if (zoom >= 11) return 40 // ~40 bins/km² en zoom 11
	if (zoom >= 10) return 20 // ~20 bins/km² en zoom 10
	if (zoom >= 9) return 10 // ~10 bins/km² en zoom 9
	if (zoom >= 8) return 5 // ~5 bins/km² en zoom 8
	return 2 // ~2 bins/km² en zoom muy bajo (< 8)
}

/**
 * Calcula límite máximo de bins según zoom
 * Valores restrictivos para forzar al usuario a acercarse y evitar bloqueos
 */
export const getMaxBinsByZoom = (zoom: number): number => {
	if (zoom >= 14) return Infinity // Mostrar todos en zoom alto
	if (zoom >= 13) return 100 // Máximo 200 bins en zoom 13
	if (zoom >= 12) return 80 // Máximo 150 bins en zoom 12
	if (zoom >= 11) return 60 // Máximo 100 bins en zoom 11
	if (zoom >= 10) return 40 // Máximo 75 bins en zoom 10
	if (zoom >= 9) return 20 // Máximo 50 bins en zoom 9
	if (zoom >= 8) return 10 // Máximo 50 bins en zoom 8
	return 5 // Máximo 50 bins en zoom muy bajo (< 8)
}

export const sortPointsByDistance = (
	points: BinPoint[],
	center: { lng: number; lat: number },
	maxPoints: number,
): BinPoint[] => {
	return points
		.map((point, index) => ({
			index,
			distance: calculateDistance(
				{
					lat: point.geometry.coordinates[1],
					lng: point.geometry.coordinates[0],
				},
				center,
			),
		}))
		.sort((a, b) => a.distance - b.distance)
		.slice(0, maxPoints)
		.map(({ index }) => points[index])
}

export const limitPointsByDistance = (
	points: BinPoint[],
	center: { lng: number; lat: number },
	zoom: number,
): BinPoint[] => {
	// A zoom >= 14, ya no hay clustering y deberíamos mostrar todos los puntos del viewport
	// sin filtrar por distancia. Solo aplicar filtro en zooms bajos.
	if (zoom >= MapZoomLevels.NEIGHBORHOOD) {
		return points
	}
	const maxPoints = MAX_VISIBLE_POINTS_LOW_ZOOM
	if (points.length <= maxPoints) {
		return points
	}
	const sortedPoints = sortPointsByDistance(points, center, maxPoints)
	if (__DEV__) {
		console.log(
			`🔍 Limited points by distance: ${points.length} → ${sortedPoints.length} (zoom: ${zoom})`,
		)
	}

	return sortedPoints
}

/**
 * Muestrea bins distribuyéndolos por barrios/distritos para mejor distribución geográfica
 * Prioriza distribución geográfica uniforme en el viewport
 */
export const sampleBinsByNeighborhoods = (
	points: BinPoint[],
	maxBins: number,
	bounds: LngLatBounds,
): BinPoint[] => {
	if (!points.length || maxBins <= 0) return []

	const viewportCenter = getViewportCenter(bounds)
	const neighborhoods = buildNeighborhoods(points, viewportCenter)
	if (!neighborhoods.length) return []

	const interleaved = interleaveNeighborhoods(neighborhoods)
	const binsPerNeighborhood = Math.max(
		1,
		Math.floor(maxBins / interleaved.length),
	)

	console.log(
		`🔍 [SAMPLING] Distributing across ${interleaved.length} neighborhoods (${
			new Set(interleaved.map(n => quadrantForAngle(n.angle))).size
		} quadrants), ~${binsPerNeighborhood} bins each`,
	)

	const sampled = interleaved.reduce<BinPoint[]>((acc, neighborhood) => {
		if (acc.length >= maxBins) return acc

		const remainingSlots = maxBins - acc.length
		const toTake = Math.min(binsPerNeighborhood, remainingSlots)
		acc.push(...pickNeighborhoodBins(neighborhood.bins, viewportCenter, toTake))
		return acc
	}, [])

	return fillRemaining(points, sampled, viewportCenter, maxBins)
}

const getViewportCenter = (bounds: LngLatBounds) => {
	const [[minLng, minLat], [maxLng, maxLat]] = bounds
	return { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 }
}

const buildNeighborhoods = (
	points: BinPoint[],
	viewportCenter: { lat: number; lng: number },
): NeighborhoodGroup[] => {
	const byNeighborhood = groupBins(points)

	return Array.from(byNeighborhood.entries()).map(([code, bins]) => {
		const center = calculateNeighborhoodCenter(bins)
		return {
			code,
			bins,
			center,
			angle: Math.atan2(
				center.lat - viewportCenter.lat,
				center.lng - viewportCenter.lng,
			),
		}
	})
}

const interleaveNeighborhoods = (neighborhoods: NeighborhoodGroup[]) => {
	const sorted = [...neighborhoods].sort((a, b) => {
		const quadrantDiff = quadrantForAngle(a.angle) - quadrantForAngle(b.angle)
		return quadrantDiff === 0 ? a.angle - b.angle : quadrantDiff
	})

	const quadrants = new Map<number, NeighborhoodGroup[]>()
	for (const neighborhood of sorted) {
		const quadrant = quadrantForAngle(neighborhood.angle)
		if (!quadrants.has(quadrant)) quadrants.set(quadrant, [])
		quadrants.get(quadrant)!.push(neighborhood)
	}

	const maxPerQuadrant = Math.max(
		...Array.from(quadrants.values()).map(arr => arr.length),
	)
	const interleaved: NeighborhoodGroup[] = []

	for (let i = 0; i < maxPerQuadrant; i++) {
		for (const quadrant of [0, 1, 2, 3]) {
			const list = quadrants.get(quadrant)
			if (list?.[i]) interleaved.push(list[i])
		}
	}

	return interleaved
}

const quadrantForAngle = (angle: number) =>
	Math.floor((angle + Math.PI) / (Math.PI / 2))

const pickNeighborhoodBins = (
	neighborhoodBins: BinPoint[],
	viewportCenter: { lat: number; lng: number },
	toTake: number,
) => {
	if (neighborhoodBins.length <= toTake) return [...neighborhoodBins]

	const sorted = sortByDistance(neighborhoodBins, viewportCenter)
	const step = Math.max(1, Math.floor(sorted.length / toTake))

	const selected: BinPoint[] = []
	const selectedIds = new Set<string>()

	for (let i = 0; i < toTake; i++) {
		const index = alternateIndex(i, sorted.length, step)
		const bin = sorted[index]
		const id = bin.properties.binId
		if (!selectedIds.has(id)) {
			selected.push(bin)
			selectedIds.add(id)
		}
	}

	for (let i = 0; selected.length < toTake && i < sorted.length; i += step) {
		const bin = sorted[i]
		const id = bin.properties.binId
		if (!selectedIds.has(id)) {
			selected.push(bin)
			selectedIds.add(id)
		}
	}

	return selected.slice(0, toTake)
}

const alternateIndex = (iteration: number, total: number, step: number) => {
	const half = Math.floor(iteration / 2)
	const rawIndex = iteration % 2 === 0 ? half * step : total - 1 - half * step
	return Math.max(0, Math.min(rawIndex, total - 1))
}

const sortByDistance = (
	bins: BinPoint[],
	viewportCenter: { lat: number; lng: number },
): BinPoint[] =>
	[...bins].sort((a, b) => {
		const distA = calculateDistance(viewportCenter, toLatLng(a))
		const distB = calculateDistance(viewportCenter, toLatLng(b))
		return distA - distB
	})

const toLatLng = (bin: BinPoint) => {
	const [lng, lat] = bin.geometry.coordinates
	return { lat, lng }
}

const fillRemaining = (
	allBins: BinPoint[],
	sampledBins: BinPoint[],
	viewportCenter: { lat: number; lng: number },
	maxBins: number,
) => {
	if (sampledBins.length >= maxBins) return sampledBins

	const sampledIds = new Set(sampledBins.map(b => b.properties.binId))
	const remaining = allBins
		.filter(bin => !sampledIds.has(bin.properties.binId))
		.sort((a, b) => {
			const distA = calculateDistance(viewportCenter, toLatLng(a))
			const distB = calculateDistance(viewportCenter, toLatLng(b))
			return distA - distB
		})

	return [...sampledBins, ...remaining.slice(0, maxBins - sampledBins.length)]
}

const groupBins = (points: BinPoint[]) => {
	const grouped = new Map<string, BinPoint[]>()
	for (const point of points) {
		const key = point.properties.neighborhood_code || DEFAULT_NEIGHBORHOOD
		if (!grouped.has(key)) grouped.set(key, [])
		grouped.get(key)!.push(point)
	}
	return grouped
}

export const filterPointsByBounds = (
	points: BinPoint[],
	bounds: LngLatBounds,
	zoom: number,
): BinPoint[] => {
	// Expandir bounds con buffer dinámico según zoom
	// Esto evita que se vean zonas vacías al hacer pan
	const expandedBounds = expandBoundsWithBuffer(bounds, zoom)
	const [[minLng, minLat], [maxLng, maxLat]] = expandedBounds

	const effectiveMinLng = minLng
	const effectiveMaxLng = maxLng
	const effectiveMinLat = minLat
	const effectiveMaxLat = maxLat

	const filtered = points.filter(point => {
		const [lng, lat] = point.geometry.coordinates
		const inBounds =
			lng >= effectiveMinLng &&
			lng <= effectiveMaxLng &&
			lat >= effectiveMinLat &&
			lat <= effectiveMaxLat

		return inBounds
	})

	console.log(`🔍 [FILTERBOUNDS] Result: ${points.length} → ${filtered.length}`)

	// Debug adicional: Verificar distribución geográfica de los bins filtrados
	if (filtered.length === 0 && points.length > 0) {
		const samplePoints = points.slice(0, 10)
		console.warn(`⚠️ [FILTERBOUNDS] No bins in bounds, sample points:`, {
			bounds: {
				minLng: effectiveMinLng,
				maxLng: effectiveMaxLng,
				minLat: effectiveMinLat,
				maxLat: effectiveMaxLat,
			},
			samplePoints: samplePoints.map(p => ({
				binId: p.properties.binId,
				coords: p.geometry.coordinates,
				district_code: p.properties.district_code,
				address: p.properties.address?.substring(0, 30),
			})),
		})
	}

	return filtered
}
