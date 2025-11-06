import { BinPoint, LngLatBounds, MapZoomLevels } from '@map/types/mapData'
import { RouteData, RouteGeometryFeature } from '@map/types/navigation'
import {
	booleanPointInPolygon,
	along,
	length,
	featureCollection,
	lineString,
	point,
} from '@turf/turf'
import { buffer } from '@turf/buffer'
import {
	STEP_WALKING_METERS,
	MAX_POINTS_TO_SHOW_IN_ROOT,
} from '@map/constants/navigation'
import { Feature, FeatureCollection, GeoJsonProperties, Geometry, Point } from 'geojson'

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
	if (!route?.geometry) {
		return null
	}

	// Crear ID único para la ruta basado en distancia y duración
	const routeId = `${route.distance}-${route.duration}-${bufferDistance}`

	// Verificar cache
	if (cachedCorridor?.routeId === routeId) {
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
		const pointFeature = point(binPoint.geometry.coordinates)
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
	if (!route?.geometry) {
		return null
	}

	try {

		const expandedBuffer = buffer(route.geometry, padding, {
			units: 'meters',
		})

		if (!expandedBuffer) {
			return null
		}

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

export const clearRouteCorridorCache = (): void => {
	cachedCorridor = null
	console.log('🛣️ [ROUTE_CORRIDOR] Cache cleared')
}

const STEP_BY_BUCKET: Record<keyof typeof MapZoomLevels, number> = {
	GENERAL: 150, // z <= 10 aprox.
	DISTRICT: 80, // z 11..13
	NEIGHBORHOOD: 35, // z 14..15
	CONTAINER: 14, // z >= 16
	CLUSTER: 35, // lo obviamos, pero por si alguien lo usa
}

const zoomToBucket = (zoom: number): keyof typeof MapZoomLevels => {
	if (zoom < MapZoomLevels.DISTRICT - 0.25) return 'GENERAL'
	if (zoom < MapZoomLevels.NEIGHBORHOOD - 0.25) return 'DISTRICT'
	if (zoom < MapZoomLevels.CONTAINER - 0.25) return 'NEIGHBORHOOD'
	return 'CONTAINER'
}

const dotsCache = new Map<
	string,
	FeatureCollection<Geometry, GeoJsonProperties>
	>()

	const collectPoints = (coords: number[][], stepMeters: number) => {
		const ls = lineString(coords)
		const dist = length(ls, { units: 'meters' })
		const pts: Feature<Point, GeoJsonProperties>[] = []
		for (let d = 0; d <= dist; d += stepMeters) {
			pts.push(
				along(ls, d, { units: 'meters' }),
			)
		}
		return pts
	}

	const sampleFeature = (
		feature: RouteGeometryFeature,
		stepMeters: number,
	): FeatureCollection<Geometry, GeoJsonProperties> => {
		const g = feature.geometry
		if (g.type === 'LineString') {
			return featureCollection(
				collectPoints(g.coordinates, stepMeters),
			) as FeatureCollection<Geometry, GeoJsonProperties>
		}
		if (g.type === 'MultiLineString') {
			const all: Feature<Point, GeoJsonProperties>[] = []
			for (const seg of g.coordinates)
				all.push(...collectPoints(seg, stepMeters))
			return featureCollection(all) as FeatureCollection<
				Geometry,
				GeoJsonProperties
			>
		}
		return { type: 'FeatureCollection', features: [] } as FeatureCollection<
			Geometry,
			GeoJsonProperties
		>
	}

export const buildRouteDotsByZoom = (
	feature: RouteGeometryFeature,
	zoom: number,
	routeId: string,
	opts?: {
		maxPoints?: number
		overrideStepByBucket?: Partial<typeof STEP_BY_BUCKET>
	},
): FeatureCollection<Geometry, GeoJsonProperties> => {
	const bucket = zoomToBucket(zoom)
	const step = opts?.overrideStepByBucket?.[bucket] ?? STEP_BY_BUCKET[bucket]
	const cacheKey = `${routeId}@${bucket}@${step}`

	const cached = dotsCache.get(cacheKey)
	if (cached) return cached

	let fc = sampleFeature(feature, step)

	// Cap opcional por rendimiento
	const maxPoints = opts?.maxPoints ?? 2500
	if (fc.features.length > maxPoints) {
		const stepDown = Math.ceil(fc.features.length / maxPoints)
		fc = {
			type: 'FeatureCollection',
			features: fc.features.filter((_, i) => i % stepDown === 0),
		} as FeatureCollection<Geometry, GeoJsonProperties>
	}

	dotsCache.set(cacheKey, fc)
	return fc
}
