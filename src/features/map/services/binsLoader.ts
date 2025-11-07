import { BinsService } from '@/db/bins/service'
import { BinType } from '@/shared/types/bins'
import { MAX_VISIBLE_POINTS_LOW_ZOOM } from '@map/constants/clustering'
import { useMapBinsStore } from '@map/stores/mapBinsStore'
import { BinPoint, type LngLatBounds } from '@map/types/mapData'
import { RouteData } from '@map/types/navigation'
import {
	calculateDistance,
	convertContainersToGeoJSON,
} from '@map/utils/geoUtils'
import {
	createRouteCorridor,
	filterPointsByRouteCorridor,
} from '@map/utils/routeUtils'

export interface BinsCache {
	get: (key: BinType) => BinPoint[] | null
	set: (key: BinType, value: BinPoint[]) => void
	clear: (key?: BinType) => void
}

export const loadContainersAsGeoJSON = async (
	binType: BinType,
	cache: BinsCache,
): Promise<BinPoint[]> => {
	console.log(`🔄 loadContainersAsGeoJSON called for ${binType}`)

	try {
		const cachedPoints = cache.get(binType)
		if (cachedPoints) {
			console.log(`✅ Cache hit for ${binType}: ${cachedPoints.length} points`)
			return cachedPoints
		}

		console.log(`📥 Cache miss for ${binType}, loading containers...`)

		const containers = await BinsService.getContainersData(binType)

		if (!containers || containers.length === 0) {
			return []
		}

		const points = convertContainersToGeoJSON(containers, binType)
		console.log(
			`✅ Converted ${containers.length} containers → ${points.length} GeoJSON points for ${binType}`,
		)

		cache.set(binType, points)
		return points
	} catch (error) {
		console.error(`❌ Error loading containers for ${binType}:`, error)
		return []
	}
}

export const clearBinsCache = (cache: BinsCache): void => {
	cache.clear()
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

const limitPointsByDistance = (
	points: BinPoint[],
	center: { lng: number; lat: number },
	zoom: number,
): BinPoint[] => {
	// A zoom >= 14, ya no hay clustering y deberíamos mostrar todos los puntos del viewport
	// sin filtrar por distancia. Solo aplicar filtro en zooms bajos.
	if (zoom >= 14) {
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

const filterPointsByBounds = (
	points: BinPoint[],
	bounds: LngLatBounds,
	zoom: number,
): BinPoint[] => {
	const [[minLng, minLat], [maxLng, maxLat]] = bounds

	// Para zoom alto (>= 14), reducir el área visible en lugar de expandirla
	// Esto asegura que solo se muestren bins realmente visibles en pantalla
	let effectiveMinLng = minLng
	let effectiveMaxLng = maxLng
	let effectiveMinLat = minLat
	let effectiveMaxLat = maxLat

	if (zoom >= 14) {
		// Reducir el área al 60% del viewport (eliminar 20% de cada lado)
		const lngRange = maxLng - minLng
		const latRange = maxLat - minLat
		const reduction = 0.2 // 20% de cada lado = 40% total

		effectiveMinLng = minLng + lngRange * reduction
		effectiveMaxLng = maxLng - lngRange * reduction
		effectiveMinLat = minLat + latRange * reduction
		effectiveMaxLat = maxLat - latRange * reduction
	}

	return points.filter(point => {
		const [lng, lat] = point.geometry.coordinates
		return (
			lng >= effectiveMinLng &&
			lng <= effectiveMaxLng &&
			lat >= effectiveMinLat &&
			lat <= effectiveMaxLat
		)
	})
}

const filterPointsByRoute = (
	points: BinPoint[],
	route: RouteData,
	zoom: number,
): BinPoint[] => {
	console.log('🛣️ [FILTERPOINTS] Route active, using corridor filter')
	const corridor = createRouteCorridor(route, 500) // 500m de ancho
	const filteredPoints = filterPointsByRouteCorridor(points, corridor)
	console.log('🛣️ [FILTERPOINTS] Route corridor filter result:', {
		input: points.length,
		output: filteredPoints.length,
		ratio: ((filteredPoints.length / points.length) * 100).toFixed(1) + '%',
		routeDistance: `${route.distance}m`,
		zoom,
	})
	return filteredPoints
}

const filterPointsByZoom = (
	points: BinPoint[],
	bounds: LngLatBounds,
	zoom: number,
): BinPoint[] => {
	// A zoom >= 14, ya no hay clustering y deberíamos mostrar todos los puntos del viewport
	// sin filtrar por distancia. Solo aplicar filtro en zooms bajos.
	console.log('🔍 [FILTERPOINTS] Zoom >= 14, filtering ONLY by bounds')
	const filteredPoints = filterPointsByBounds(points, bounds, zoom)
	console.log('🔍 [FILTERPOINTS] High zoom filter result:', {
		input: points.length,
		output: filteredPoints.length,
		ratio: ((filteredPoints.length / points.length) * 100).toFixed(1) + '%',
	})
	return filteredPoints
}

const filterPointsByCenter = (
	points: BinPoint[],
	center: { lng: number; lat: number },
	zoom: number,
): BinPoint[] => {
	console.log('🔍 [FILTERPOINTS] Applying distance filter...')
	const beforeDistance = points.length
	const filteredPoints = limitPointsByDistance(points, center, zoom)
	console.log('🔍 [FILTERPOINTS] After distance filter:', {
		input: beforeDistance,
		output: filteredPoints.length,
		ratio: ((filteredPoints.length / beforeDistance) * 100).toFixed(1) + '%',
	})
	return filteredPoints
}

export const filterPointsForViewport = (
	points: BinPoint[],
	zoom: number,
	bounds: LngLatBounds,
	center: { lng: number; lat: number } | null,
	route: RouteData | null = null,
): BinPoint[] => {
	console.log('🔍 [FILTERPOINTS] Called with:', {
		pointsCount: points.length,
		zoom,
		hasBounds: !!bounds,
		bounds: bounds ? `${bounds[0]} to ${bounds[1]}` : 'null',
		hasCenter: !!center,
		center: center ? `${center.lat}, ${center.lng}` : 'null',
		hasRoute: !!route,
		routeDistance: route ? `${route.distance}m` : 'null',
	})

	// Si hay ruta activa, usar corredor de ruta en lugar de bounds
	if (route) return filterPointsByRoute(points, route, zoom)

	// Para todos los zooms, filtrar por bounds. Dejamos que el clustering gestione la agregación.
	// En zooms altos, el helper mantiene solo bounds, en bajos también usamos bounds sin recorte por distancia.
	if (zoom >= 14) return filterPointsByZoom(points, bounds, zoom)

	console.log('🔍 [FILTERPOINTS] Applying bounds filter...')
	const filteredPoints = filterPointsByBounds(points, bounds, zoom)
	console.log('🔍 [FILTERPOINTS] After bounds filter:', {
		input: points.length,
		output: filteredPoints.length,
		ratio: ((filteredPoints.length / points.length) * 100).toFixed(1) + '%',
	})

	// Ya no recortamos por distancia (800). Mostramos todos los puntos dentro de bounds
	if (__DEV__ && filteredPoints.length < points.length * 0.8) {
		console.log(
			`🔍 [FILTERPOINTS] Final filtered ${points.length} → ${filteredPoints.length} points (zoom: ${zoom})`,
		)
	}

	console.log(
		'🔍 [FILTERPOINTS] Returning filtered points:',
		filteredPoints.length,
	)
	return filteredPoints
}

export const filteredPointsByNearby = async (
	points: BinPoint[],
	center: { lng: number; lat: number },
	maxDistance: number,
) => {
	const filteredPoints = points.filter(point => {
		return (
			calculateDistance(
				{
					lat: point.geometry.coordinates[1],
					lng: point.geometry.coordinates[0],
				},
				center,
			) <= maxDistance
		)
	})

	console.log('🔍 [FILTEREDPOINTSBYNEARBY] Filtered points:', filteredPoints)
	useMapBinsStore.getState().setFilteredPoints(filteredPoints)
}
