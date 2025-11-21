import { getContainersData, getContainersDataInBounds } from '@/db/bins/service'
import { BinType } from '@/shared/types/bins'
import { MAX_VISIBLE_POINTS_LOW_ZOOM } from '@map/constants/clustering'
import { useMapBinsStore } from '@map/stores/mapBinsStore'
import { BinPoint, MapZoomLevels, type LngLatBounds } from '@map/types/mapData'
import { RouteData } from '@map/types/navigation'
import {
	calculateDistance,
	convertContainersToGeoJSON,
	convertContainersToGeoJSONChunked,
	getCurrentBoundsArea,
} from '@map/utils/geoUtils'
import {
	createRouteCorridor,
	filterPointsByRouteCorridor,
} from '@map/utils/routeUtils'
import {
	readGeoJsonCache,
	writeGeoJsonCache,
} from '@map/services/geoJsonCacheService'
import { expandBoundsWithBuffer } from './mapService'

export interface BinsCache {
	get: (key: BinType) => BinPoint[] | null
	set: (key: BinType, value: BinPoint[]) => void
	clear: (key?: BinType) => void
}

export const loadContainersAsGeoJSON = async (
	binType: BinType,
	cache: BinsCache,
): Promise<BinPoint[]> => {
	console.time(`⏱️ [GEOJSON_LOAD] total-${binType}`)
	console.log(`🔄 loadContainersAsGeoJSON called for ${binType}`)

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

		console.log(`📥 Cache miss for ${binType}, loading containers...`)

		const containers = await getContainersData(binType)

		if (!containers || containers.length === 0) {
			console.timeEnd(`⏱️ [GEOJSON_LOAD] total-${binType}`)
			return []
		}

		console.time(`⏱️ [GEOJSON_LOAD] convert-${binType}`)
		const points = await convertContainersToGeoJSONChunked(
			containers,
			binType,
			processed =>
				console.log(
					`⏱️ [GEOJSON_LOAD] ${binType} conversion progress ${processed}/${containers.length}`,
				),
		)
		console.timeEnd(`⏱️ [GEOJSON_LOAD] convert-${binType}`)
		console.log(
			`✅ Converted ${containers.length} containers → ${points.length} GeoJSON points for ${binType}`,
		)

		cache.set(binType, points)
		writeGeoJsonCache(binType, points).catch(error =>
			console.warn(`⚠️ [GEOJSON_LOAD] Failed to persist cache for ${binType}`, error),
		)
		console.timeEnd(`⏱️ [GEOJSON_LOAD] total-${binType}`)
		return points
	} catch (error) {
		console.error(`❌ Error loading containers for ${binType}:`, error)
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

const filterPointsByBounds = (
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

	// Debug: Log de primeros puntos y bounds
	if (points.length > 0) {
		console.log(`🔍 [FILTERBOUNDS] Filtering ${points.length} points:`, {
			bounds: {
				original: { minLng, maxLng, minLat, maxLat },
				effective: {
					effectiveMinLng,
					effectiveMaxLng,
					effectiveMinLat,
					effectiveMaxLat,
				},
			},
			samplePoints: {
				first: {
					coords: points[0].geometry.coordinates,
					lat: points[0].geometry.coordinates[1],
					lng: points[0].geometry.coordinates[0],
					latType: typeof points[0].geometry.coordinates[1],
					lngType: typeof points[0].geometry.coordinates[0],
				},
				middle: {
					coords: points[Math.floor(points.length / 2)].geometry.coordinates,
					lat: points[Math.floor(points.length / 2)].geometry.coordinates[1],
					lng: points[Math.floor(points.length / 2)].geometry.coordinates[0],
					latType:
						typeof points[Math.floor(points.length / 2)].geometry
							.coordinates[1],
					lngType:
						typeof points[Math.floor(points.length / 2)].geometry
							.coordinates[0],
				},
			},
		})
	}

	let binsFueraDeBoundsCount = 0
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
				containerId: p.properties.containerId,
				coords: p.geometry.coordinates,
				district_code: p.properties.district_code,
				address: p.properties.address?.substring(0, 30),
			})),
		})
	}

	return filtered
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

/**
 * Calcula límite máximo de bins según zoom
 * Valores restrictivos para forzar al usuario a acercarse y evitar bloqueos
 */
const getMaxBinsByZoom = (zoom: number): number => {
	if (zoom >= 14) return Infinity // Mostrar todos en zoom alto
	if (zoom >= 13) return 100 // Máximo 200 bins en zoom 13
	if (zoom >= 12) return 80 // Máximo 150 bins en zoom 12
	if (zoom >= 11) return 60 // Máximo 100 bins en zoom 11
	if (zoom >= 10) return 40 // Máximo 75 bins en zoom 10
	if (zoom >= 9) return 20 // Máximo 50 bins en zoom 9
	if (zoom >= 8) return 10 // Máximo 50 bins en zoom 8
	return 5 // Máximo 50 bins en zoom muy bajo (< 8)
}

/**
 * Calcula densidad objetivo de bins según zoom (bins por km²)
 * Valores más restrictivos para forzar al usuario a acercarse
 */
const getTargetDensity = (zoom: number): number => {
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
 * Calcula el centro geográfico de un conjunto de bins
 */
const calculateNeighborhoodCenter = (
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
 * Muestrea bins distribuyéndolos por barrios/distritos para mejor distribución geográfica
 * Prioriza distribución geográfica uniforme en el viewport
 */
const sampleBinsByNeighborhoods = (
	points: BinPoint[],
	maxBins: number,
	bounds: LngLatBounds,
): BinPoint[] => {
	// Agrupar bins por barrio (neighborhood_code)
	const binsByNeighborhood = new Map<string, BinPoint[]>()

	for (const point of points) {
		const neighborhood = point.properties.neighborhood_code || 'unknown'
		if (!binsByNeighborhood.has(neighborhood)) {
			binsByNeighborhood.set(neighborhood, [])
		}
		binsByNeighborhood.get(neighborhood)!.push(point)
	}

	// Calcular centro del viewport para distribución geográfica
	const [[minLng, minLat], [maxLng, maxLat]] = bounds
	const viewportCenter = {
		lat: (minLat + maxLat) / 2,
		lng: (minLng + maxLng) / 2,
	}

	// Crear lista de barrios con su centro y cantidad de bins
	const neighborhoodData = Array.from(binsByNeighborhood.entries()).map(
		([code, bins]) => {
			const center = calculateNeighborhoodCenter(bins)
			// Calcular ángulo desde el centro del viewport para distribución circular
			const angle = Math.atan2(
				center.lat - viewportCenter.lat,
				center.lng - viewportCenter.lng,
			)
			return {
				code,
				bins,
				center,
				count: bins.length,
				angle, // Ángulo para distribución circular uniforme
			}
		},
	)

	// Dividir el viewport en cuadrantes y distribuir barrios equitativamente
	// Ordenar por ángulo (distribución circular) en lugar de distancia
	// Esto asegura que los bins se distribuyan por todo el viewport, no solo el centro
	neighborhoodData.sort((a, b) => {
		// Primero por cuadrante (N, E, S, W), luego por ángulo dentro del cuadrante
		const quadrantA = Math.floor((a.angle + Math.PI) / (Math.PI / 2))
		const quadrantB = Math.floor((b.angle + Math.PI) / (Math.PI / 2))

		if (quadrantA !== quadrantB) {
			return quadrantA - quadrantB
		}

		// Dentro del mismo cuadrante, ordenar por ángulo
		return a.angle - b.angle
	})

	// Agrupar barrios por cuadrante para distribución round-robin
	const neighborhoodsByQuadrant = new Map<number, typeof neighborhoodData>()
	for (const neighborhood of neighborhoodData) {
		const quadrant = Math.floor((neighborhood.angle + Math.PI) / (Math.PI / 2))
		if (!neighborhoodsByQuadrant.has(quadrant)) {
			neighborhoodsByQuadrant.set(quadrant, [])
		}
		neighborhoodsByQuadrant.get(quadrant)!.push(neighborhood)
	}

	// Crear lista intercalada de barrios (round-robin por cuadrante)
	const interleavedNeighborhoods: typeof neighborhoodData = []
	const maxPerQuadrant = Math.max(
		...Array.from(neighborhoodsByQuadrant.values()).map(arr => arr.length),
	)

	for (let i = 0; i < maxPerQuadrant; i++) {
		for (const quadrant of [0, 1, 2, 3]) {
			const quadrantNeighborhoods = neighborhoodsByQuadrant.get(quadrant) || []
			if (i < quadrantNeighborhoods.length) {
				interleavedNeighborhoods.push(quadrantNeighborhoods[i])
			}
		}
	}

	const sampledBins: BinPoint[] = []
	const binsPerNeighborhood = Math.max(
		1,
		Math.floor(maxBins / interleavedNeighborhoods.length),
	)

	console.log(
		`🔍 [SAMPLING] Distributing across ${interleavedNeighborhoods.length} neighborhoods (${neighborhoodsByQuadrant.size} quadrants), ~${binsPerNeighborhood} bins each`,
	)

	// Distribuir bins equitativamente por barrio, intercalando cuadrantes
	for (const { bins: neighborhoodBins } of interleavedNeighborhoods) {
		if (sampledBins.length >= maxBins) break

		const toTake = Math.min(binsPerNeighborhood, neighborhoodBins.length)

		// Si hay pocos bins en el barrio, tomar todos
		if (neighborhoodBins.length <= toTake) {
			sampledBins.push(...neighborhoodBins)
			continue
		}

		// Distribuir bins uniformemente en el espacio del viewport
		// Ordenar por distancia al viewport center para distribución más uniforme global
		const sortedBins = [...neighborhoodBins].sort((a, b) => {
			const [lngA, latA] = a.geometry.coordinates
			const [lngB, latB] = b.geometry.coordinates
			const distA = calculateDistance(viewportCenter, {
				lat: latA,
				lng: lngA,
			})
			const distB = calculateDistance(viewportCenter, {
				lat: latB,
				lng: lngB,
			})
			return distA - distB
		})

		// Distribución uniforme: tomar bins distribuidos equitativamente
		// pero intercalando cercanos y lejanos para mejor cobertura espacial
		const selectedBins: BinPoint[] = []
		const step = Math.max(1, Math.floor(sortedBins.length / toTake))
		const selectedIds = new Set<string>()

		// Estrategia: alternar entre bins cercanos (inicio) y lejanos (final)
		// para distribuir mejor por todo el área del barrio
		for (let i = 0; i < toTake && sampledBins.length < maxBins; i++) {
			let index: number

			if (i % 2 === 0) {
				// Par: tomar del inicio (cercanos al centro)
				index = Math.floor(i / 2) * step
			} else {
				// Impar: tomar del final (lejanos del centro)
				index = sortedBins.length - 1 - Math.floor(i / 2) * step
			}

			// Asegurar que el índice sea válido y no duplicado
			index = Math.max(0, Math.min(index, sortedBins.length - 1))
			const bin = sortedBins[index]
			const binId = bin.properties.containerId

			if (!selectedIds.has(binId)) {
				selectedBins.push(bin)
				selectedIds.add(binId)
			}
		}

		// Si aún no tenemos suficientes, completar con distribución uniforme estándar
		if (selectedBins.length < toTake) {
			for (
				let i = 0;
				i < sortedBins.length &&
				selectedBins.length < toTake &&
				sampledBins.length < maxBins;
				i += step
			) {
				const bin = sortedBins[i]
				const binId = bin.properties.containerId

				if (!selectedIds.has(binId)) {
					selectedBins.push(bin)
					selectedIds.add(binId)
				}
			}
		}

		sampledBins.push(...selectedBins)
	}

	// Si aún tenemos espacio, llenar con bins restantes distribuidos geográficamente
	if (sampledBins.length < maxBins) {
		const sampledIds = new Set(sampledBins.map(b => b.properties.containerId))
		const remainingBins = points
			.filter(p => !sampledIds.has(p.properties.containerId))
			.sort((a, b) => {
				const [lngA, latA] = a.geometry.coordinates
				const [lngB, latB] = b.geometry.coordinates
				const distA = calculateDistance(viewportCenter, {
					lat: latA,
					lng: lngA,
				})
				const distB = calculateDistance(viewportCenter, {
					lat: latB,
					lng: lngB,
				})
				return distA - distB
			})

		const needed = maxBins - sampledBins.length
		sampledBins.push(...remainingBins.slice(0, needed))
	}

	return sampledBins
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

	// Si hay ruta activa, usar corredor de ruta en lugar de bounds
	// if (route) return filterPointsByRoute(points, route, zoom)

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
