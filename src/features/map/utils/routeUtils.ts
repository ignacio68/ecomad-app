import { BinPoint, LngLatBounds } from '@map/types/mapData'
import { RouteData } from '@map/types/navigation'
import { booleanPointInPolygon } from '@turf/turf'
import { buffer } from '@turf/buffer'
import * as turf from '@turf/turf'

// Cache simple para el corredor de ruta
let cachedCorridor: { routeId: string; corridor: any } | null = null

/**
 * Crea un corredor (buffer) alrededor de una ruta para filtrar contenedores
 * @param route - Ruta activa
 * @param bufferDistance - Distancia del buffer en metros (default: 200m)
 * @returns Polygon del corredor o null si no hay ruta
 */
export const createRouteCorridor = (
	route: RouteData | null,
	bufferDistance: number = 200,
): any | null => {
	if (!route || !route.geometry) {
		return null
	}

	// Crear ID único para la ruta basado en distancia y duración
	const routeId = `${route.distance}-${route.duration}-${bufferDistance}`

	// Verificar cache
	if (cachedCorridor && cachedCorridor.routeId === routeId) {
		console.log('🛣️ [ROUTE_CORRIDOR] Using cached corridor')
		return cachedCorridor.corridor
	}

	try {
		// Crear buffer alrededor de la ruta con opciones optimizadas
		const routeBuffer = buffer(route.geometry, bufferDistance, {
			units: 'meters',
			steps: 8, // Reducir pasos para mejor performance
		})

		// Guardar en cache
		cachedCorridor = { routeId, corridor: routeBuffer }

		console.log('🛣️ [ROUTE_CORRIDOR] Created corridor:', {
			bufferDistance: `${bufferDistance}m`,
			routeLength: route.distance,
			routeDuration: route.duration,
			steps: 8,
		})

		return routeBuffer
	} catch (error) {
		console.error('❌ [ROUTE_CORRIDOR] Error creating corridor:', error)
		return null
	}
}

/**
 * Filtra contenedores que están dentro del corredor de ruta
 * @param points - Array de contenedores
 * @param corridor - Polygon del corredor
 * @returns Array filtrado de contenedores
 */
export const filterPointsByRouteCorridor = (
	points: BinPoint[],
	corridor: any | null,
): BinPoint[] => {
	if (!corridor) {
		console.log('🛣️ [ROUTE_CORRIDOR] No corridor, returning all points')
		return points
	}

	const filteredPoints = points.filter(binPoint => {
		const pointFeature = turf.point(binPoint.geometry.coordinates)
		return booleanPointInPolygon(pointFeature, corridor)
	})

	console.log('🛣️ [ROUTE_CORRIDOR] Filtered points:', {
		input: points.length,
		output: filteredPoints.length,
		ratio: ((filteredPoints.length / points.length) * 100).toFixed(1) + '%',
		bufferDistance: '500m',
	})

	return filteredPoints
}

/**
 * Calcula bounds expandidos para incluir toda la ruta
 * @param route - Ruta activa
 * @param padding - Padding adicional en metros (default: 500m)
 * @returns Bounds expandidos o null
 */
export const calculateRouteBounds = (
	route: RouteData | null,
	padding: number = 500,
): LngLatBounds | null => {
	if (!route || !route.geometry) {
		return null
	}

	try {
		// Crear buffer expandido para bounds
		const expandedBuffer = buffer(route.geometry, padding, {
			units: 'meters',
		})

		if (!expandedBuffer) {
			return null
		}

		// Obtener bbox del buffer
		const bbox = expandedBuffer.bbox
		if (!bbox) {
			return null
		}

		const bounds: LngLatBounds = [
			[bbox[0], bbox[1]], // Southwest
			[bbox[2], bbox[3]], // Northeast
		]

		console.log('🛣️ [ROUTE_BOUNDS] Calculated route bounds:', {
			padding: `${padding}m`,
			bounds: `${bounds[0]} to ${bounds[1]}`,
		})

		return bounds
	} catch (error) {
		console.error('❌ [ROUTE_BOUNDS] Error calculating route bounds:', error)
		return null
	}
}

/**
 * Limpia el cache del corredor de ruta
 */
export const clearRouteCorridorCache = (): void => {
	cachedCorridor = null
	console.log('🛣️ [ROUTE_CORRIDOR] Cache cleared')
}
