import { getBinsData, getContainersDataInBounds } from '@/db/bins/service'
import { BinType } from '@/shared/types/bins'
import {
	readGeoJsonCache,
	writeGeoJsonCache,
} from '@map/services/geoJsonCacheService'
import { useMapBinsStore } from '@map/stores/mapBinsStore'
import { BinPoint,  type LngLatBounds } from '@map/types/mapData'
import { RouteData } from '@map/types/navigation'
import {
	calculateDistance,
	convertContainersToGeoJSON,
	convertContainersToGeoJSONChunked,
	getMaxBinsByZoom,
	sampleBinsByNeighborhoods,
	filterPointsByBounds
} from '@map/utils/geoUtils'
import { expandBoundsWithBuffer } from './mapService'


export interface BinsCache {
	get: (key: BinType) => BinPoint[] | null
	set: (key: BinType, value: BinPoint[]) => void
	clear: (key?: BinType) => void
}


export const loadBinsAsGeoJSON = async (
	binType: BinType,
	cache: BinsCache,
): Promise<BinPoint[]> => {
	console.time(`⏱️ [GEOJSON_LOAD] total-${binType}`)
	console.log(`🔄 loadBinsAsGeoJSON called for ${binType}`)

	try {
		const cachedPoints = cache.get(binType)
		if (cachedPoints) {
			console.log(`✅ Cache hit for ${binType}: ${cachedPoints.length} points`)
			console.timeEnd(`⏱️ [GEOJSON_LOAD] total-${binType}`)
			return cachedPoints
		}

		const diskCache = await readGeoJsonCache(binType)
		if (diskCache && diskCache.length > 0) {
			cache.set(binType, diskCache)
			console.timeEnd(`⏱️ [GEOJSON_LOAD] total-${binType}`)
			return diskCache
		}

		console.log(`📥 Cache miss for ${binType}, loading bins...`)

		const bins = await getBinsData(binType)

		if (!bins || bins.length === 0) {
			console.timeEnd(`⏱️ [GEOJSON_LOAD] total-${binType}`)
			return []
		}

		console.time(`⏱️ [GEOJSON_LOAD] convert-${binType}`)
		const points = await convertContainersToGeoJSONChunked(
			bins,
			binType,
			processed =>
				console.log(
					`⏱️ [GEOJSON_LOAD] ${binType} conversion progress ${processed}/${bins.length}`,
				),
		)
		console.timeEnd(`⏱️ [GEOJSON_LOAD] convert-${binType}`)
		console.log(
			`✅ Converted ${bins.length} bins → ${points.length} GeoJSON points for ${binType}`,
		)

		cache.set(binType, points)
		writeGeoJsonCache(binType, points).catch(error =>
			console.warn(
				`⚠️ [GEOJSON_LOAD] Failed to persist cache for ${binType}`,
				error,
			),
		)
		console.timeEnd(`⏱️ [GEOJSON_LOAD] total-${binType}`)
		return points
	} catch (error) {
		console.error(`❌ Error loading bins for ${binType}:`, error)
		console.timeEnd(`⏱️ [GEOJSON_LOAD] total-${binType}`)
		return []
	}
}

export const loadViewportBinsFromDatabase = async (
	binType: BinType,
	bounds: LngLatBounds,
	zoom: number,
): Promise<BinPoint[]> => {
	console.time(`⏱️ [VIEWPORT_DB_LOAD] total-${binType}`)
	const rawBins = await getContainersDataInBounds(
		binType,
		expandBoundsWithBuffer(bounds, zoom),
	)
	if (!rawBins?.length) {
		console.timeEnd(`⏱️ [VIEWPORT_DB_LOAD] total-${binType}`)
		return []
	}

	const geoJson = convertContainersToGeoJSON(rawBins, binType)
	console.log(
		`⚡ [VIEWPORT_DB_LOAD] Loaded ${geoJson.length} bins directly from SQLite for current viewport`,
	)
	console.timeEnd(`⏱️ [VIEWPORT_DB_LOAD] total-${binType}`)
	return geoJson
}

export const clearBinsCache = (cache: BinsCache): void => {
	cache.clear()
}

/**
 * Muestrea bins proporcionalmente al área visible
 * Usa distribución por barrios para mejor representación geográfica
 */
const sampleBinsProportionalToArea = (
	points: BinPoint[],
	bounds: LngLatBounds,
	zoom: number,
): BinPoint[] => {
	const maxBinsByZoom = getMaxBinsByZoom(zoom)

	console.log(`🔍 [SAMPLING] Starting sampling:`, {
		pointsCount: points.length,
		zoom,
		maxBinsByZoom,
	})

	// Si hay menos bins que el máximo permitido, devolver todos
	if (points.length <= maxBinsByZoom) {
		console.log(
			`🔍 [SAMPLING] No sampling needed: ${points.length} <= ${maxBinsByZoom}`,
		)
		return points
	}

	// Distribuir por barrios para mejor representación geográfica
	const sampledBins = sampleBinsByNeighborhoods(points, maxBinsByZoom, bounds)

	console.log(
		`🔍 [SAMPLING] Sampled ${points.length} → ${sampledBins.length} bins (zoom: ${zoom}, max: ${maxBinsByZoom})`,
	)

	return sampledBins
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

export const filterPointsForViewport = (
	points: BinPoint[],
	zoom: number,
	bounds: LngLatBounds,
	center: { lng: number; lat: number } | null,
	route: RouteData | null = null,
	opts?: { skipSampling?: boolean },
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


	// Zoom alto (>= 14): mostrar todos los bins del viewport
	if (zoom >= 14) return filterPointsByZoom(points, bounds, zoom)

	// Zoom bajo (< 14): filtrar por bounds y luego muestrear proporcionalmente al área
	console.log('🔍 [FILTERPOINTS] Applying bounds filter...')
	const filteredByBounds = filterPointsByBounds(points, bounds, zoom)
	console.log('🔍 [FILTERPOINTS] After bounds filter:', {
		input: points.length,
		output: filteredByBounds.length,
		ratio: ((filteredByBounds.length / points.length) * 100).toFixed(1) + '%',
	})

	if (opts?.skipSampling) {
		return filteredByBounds
	}

	// Muestrear proporcionalmente al área visible
	const sampledPoints = sampleBinsProportionalToArea(
		filteredByBounds,
		bounds,
		zoom,
	)

	console.log(
		'🔍 [FILTERPOINTS] Returning sampled points:',
		sampledPoints.length,
	)
	return sampledPoints
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
