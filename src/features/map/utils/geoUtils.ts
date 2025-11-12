import { BinsContainersCacheRecord } from '@/db/bins/schema'
import { BinType } from '@/shared/types/bins'
import {
	COORDINATE_PRECISION,
	MOVEMENT_THRESHOLD_ZOOM_10,
	MOVEMENT_THRESHOLD_ZOOM_12,
	MOVEMENT_THRESHOLD_ZOOM_14,
	MOVEMENT_THRESHOLD_ZOOM_16,
	MOVEMENT_THRESHOLD_ZOOM_18,
	MOVEMENT_THRESHOLD_ZOOM_EXTREME,
} from '@map/constants/clustering'
import { BinPoint, LngLatBounds } from '@map/types/mapData'
import { area, bboxPolygon, distance, point, type Units } from '@turf/turf'

export interface Point {
	lat: number
	lng: number
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
	return `containers-${binType}-${roundedLat}-${roundedLng}-${radius}`
}

/**
 * Convierte contenedores a formato GeoJSON (función pura)
 * @param containers - Array de contenedores de la base de datos
 * @param binType - Tipo de contenedor
 * @returns Array de puntos en formato GeoJSON
 */
export const convertContainersToGeoJSON = (
	containers: BinsContainersCacheRecord[],
	binType: BinType,
): BinPoint[] => {
	if (!containers || containers.length === 0) {
		return []
	}

	const points: BinPoint[] = []

	// Debug: Log de primeras coordenadas antes de conversión
	if (containers.length > 0) {
		console.log(
			`🔍 [GEOJSON] Converting ${containers.length} containers for ${binType}:`,
			{
				first: {
					lat: containers[0].lat,
					lng: containers[0].lng,
					latType: typeof containers[0].lat,
					lngType: typeof containers[0].lng,
				},
				middle: {
					lat: containers[Math.floor(containers.length / 2)].lat,
					lng: containers[Math.floor(containers.length / 2)].lng,
					latType: typeof containers[Math.floor(containers.length / 2)].lat,
					lngType: typeof containers[Math.floor(containers.length / 2)].lng,
				},
			},
		)
	}

	for (const container of containers) {
		// Convertir coordenadas a números decimales
		const lat = Number(container.lat)
		const lng = Number(container.lng)

		if (Number.isNaN(lat) || Number.isNaN(lng)) {
			console.warn(
				'⚠️ Contenedor con coordenadas inválidas omitido',
				container.containerId,
			)
			continue
		}

		const containerId = `bin-${container.containerId}`

		points.push({
			type: 'Feature',
			properties: {
				cluster: false,
				binType,
				containerId,
				category_group_id: container.category_group_id,
				category_id: container.category_id,
				district_code: container.district_code, // Cambiado de district_id a district_code
				neighborhood_code: container.neighborhood_code, // Cambiado de neighborhood_id a neighborhood_code
				address: container.address,
				lat,
				lng,
				load_type: container.load_type,
				direction: container.direction,
				subtype: container.subtype,
				placement_type: container.placement_type,
				notes: container.notes,
				bus_stop: container.bus_stop,
				interurban_node: container.interurban_node,
			},
			geometry: {
				type: 'Point',
				coordinates: [lng, lat],
			},
		})
	}

	return points
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

const toRad = (deg: number) => (deg * Math.PI) / 180
export const haversineMeters = (
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
) => {
	const EARTH_RADIUS = 6371000
	const dLat = toRad(lat2 - lat1)
	const dLon = toRad(lon2 - lon1)
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
	return 2 * EARTH_RADIUS * Math.asin(Math.sqrt(a))
}
