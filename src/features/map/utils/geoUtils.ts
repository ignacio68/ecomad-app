import * as turf from '@turf/turf'

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
): number => {
	const from = turf.point([point1.lng, point1.lat])
	const to = turf.point([point2.lng, point2.lat])
	return turf.distance(from, to, { units: 'meters' })
}

/**
 * Obtiene el umbral de movimiento mínimo según el zoom
 * @param zoom - Nivel de zoom
 * @returns Distancia mínima en metros
 */
export const getMovementThreshold = (zoom: number): number => {
	if (zoom <= 10) return 2000 // 2km - distritos
	if (zoom <= 12) return 1000 // 1km - barrios
	if (zoom <= 14) return 500 // 500m - transición
	if (zoom <= 16) return 200 // 200m - contenedores
	if (zoom <= 18) return 100 // 100m - zoom máximo
	return 50 // 50m - zoom extremo
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
	// Redondear coordenadas a 3 decimales (~100m de precisión)
	const roundedLat = Math.round(coords.lat * 1000) / 1000
	const roundedLng = Math.round(coords.lng * 1000) / 1000
	return `containers-${binType}-${roundedLat}-${roundedLng}-${radius}`
}
