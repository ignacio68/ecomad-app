import { getTotalCount } from '@/db/bins/service'
import { loadNearbyBins } from '@/shared/services/binsDownloadService'
import type { BinType } from '@/shared/types/bins'
import { INITIAL_CENTER } from '@map/constants/map'
import {
	filterPointsForViewport,
	loadBinsAsGeoJSON,
	loadViewportBinsFromDatabase,
	type BinsCache,
} from '@/features/map/services/binsLoaderService'
import { useMapBinsStore } from '@map/stores/mapBinsStore'
import { useBinsCacheStore } from '@map/stores/binsCacheStore'
import { MapZoomLevels, type BinPoint } from '@map/types/mapData'

const binCacheWarmup = new Map<BinType, Promise<BinPoint[]>>()

const warmBinCache = (binType: BinType, cache: BinsCache) => {
	if (binCacheWarmup.has(binType)) return

	const promise = loadBinsAsGeoJSON(binType, cache)
		.catch(error =>
			console.error(
				`❌ [BINS_DISPLAY] Failed to warm cache for ${binType}`,
				error,
			),
		)
		.finally(() => binCacheWarmup.delete(binType))

	binCacheWarmup.set(binType, promise as Promise<BinPoint[]>)
}

/**
 * Muestra bins individuales filtrados por viewport
 * @param binType - Tipo de contenedor
 * @param zoom - Nivel de zoom actual
 * @param bounds - Límites del viewport
 * @param center - Centro del viewport
 * @param route - Ruta activa (opcional)
 */
export const showIndividualBins = async (
	binType: BinType,
	zoom: number,
	bounds: any,
	center: any,
	route: any = null,
): Promise<void> => {
	try {
		console.time(`⏱️ [BINS_DISPLAY] total-${binType}`)
		// En zoom bajo (< 11), usar el centro de la ciudad en lugar del center del viewport
		const LOW_ZOOM_THRESHOLD = 11
		const isLowZoom = zoom < LOW_ZOOM_THRESHOLD
		const effectiveCenter = isLowZoom
			? { lat: INITIAL_CENTER[1], lng: INITIAL_CENTER[0] }
			: center

		console.log(
			`🎯 [BINS_DISPLAY] Showing individual bins for ${binType} at zoom ${zoom}`,
		)
		console.log(`🔍 [BINS_DISPLAY] Bounds:`, bounds)
		console.log(`🔍 [BINS_DISPLAY] Center:`, center)
		if (isLowZoom) {
			console.log(
				`📍 [BINS_DISPLAY] Low zoom detected, using city center:`,
				effectiveCenter,
			)
		}

		// Obtener cache persistente del store
		const { getPointsCache, setPointsCache } = useBinsCacheStore.getState()

		// Verificar si ya tenemos los bins en cache
		const cachedBins = getPointsCache(binType)
		let allBins: BinPoint[] | null = null

		if (cachedBins && cachedBins.length > 0) {
			console.log(
				`✅ [BINS_DISPLAY] Using cached bins: ${cachedBins.length} bins`,
			)
			allBins = cachedBins
		} else {
			console.log(`📥 [BINS_DISPLAY] Loading bins from database...`)
			const binsCache = {
				get: getPointsCache,
				set: setPointsCache,
				clear: () => {},
			}

			let usedViewportSample = false

			if (bounds) {
				const viewportBins = await loadViewportBinsFromDatabase(
					binType,
					bounds,
					zoom,
				)
				if (viewportBins.length > 0) {
					allBins = viewportBins
					usedViewportSample = true
					console.log(
						`⚡ [BINS_DISPLAY] Using viewport sample (${viewportBins.length}) while warming full cache`,
					)
					warmBinCache(binType, binsCache)
				}
			}

			if (!allBins || allBins.length === 0) {
				allBins = await loadBinsAsGeoJSON(binType, binsCache)
				setPointsCache(binType, allBins)
				console.log(
					`📦 [BINS_DISPLAY] Loaded and cached ${allBins.length} bins`,
				)
			} else if (!usedViewportSample) {
				setPointsCache(binType, allBins)
			}
		}

		const resolvedBins = allBins ?? []

		const shouldUseViewportQuery =
			zoom >= MapZoomLevels.NEIGHBORHOOD && bounds && !route

		const applyFilteredBins = (filtered: BinPoint[]) => {
			const { setAllPoints, setFilteredPoints } = useMapBinsStore.getState()
			setAllPoints(resolvedBins)
			setFilteredPoints(filtered)
		}

		let filteredBins: BinPoint[] | null = null

		if (shouldUseViewportQuery) {
			console.log(
				`⚡ [BINS_DISPLAY] Using fallback while SQL viewport query loads (zoom ${zoom})`,
			)
			const fallbackFiltered = filterPointsForViewport(
				resolvedBins,
				zoom,
				bounds,
				effectiveCenter,
				route,
				{ skipSampling: zoom >= MapZoomLevels.BINS },
			)
			applyFilteredBins(fallbackFiltered)

			const viewportBins = await loadViewportBinsFromDatabase(
				binType,
				bounds,
				zoom,
			)

			if (viewportBins.length > 0) {
				console.log(
					`⚡ [BINS_DISPLAY] Viewport SQL query returned ${viewportBins.length} bins`,
				)
				applyFilteredBins(viewportBins)
				console.timeEnd(`⏱️ [BINS_DISPLAY] total-${binType}`)
				return
			}

			console.log(
				`⚠️ [BINS_DISPLAY] Viewport SQL query returned empty, keeping fallback results`,
			)
			console.timeEnd(`⏱️ [BINS_DISPLAY] total-${binType}`)
			return
		}

		filteredBins = filterPointsForViewport(
			resolvedBins,
			zoom,
			bounds,
			effectiveCenter,
			route,
		)

		console.log(
			`✅ [BINS_DISPLAY] Filtered ${resolvedBins.length} → ${filteredBins.length} bins`,
		)

		// Si no hay bins en el viewport y tenemos una muestra parcial,
		// cargar nearby bins para la nueva ubicación
		if (filteredBins.length === 0 && center && bounds) {
			const totalCount = await getTotalCount(binType)
			const hasPartialData =
				totalCount !== null && totalCount > resolvedBins.length

			if (hasPartialData) {
				console.log(
					`📍 [BINS_DISPLAY] No bins in viewport, loading nearby bins for new location`,
				)
				const nearbyResult = await loadNearbyBins(
					binType,
					{
						latitude: effectiveCenter.lat,
						longitude: effectiveCenter.lng,
						radius: 1, // Se calculará dinámicamente
					},
					bounds,
					zoom,
				)

				if (nearbyResult.success && nearbyResult.data.length > 0) {
					showNearbyBins(
						binType,
						nearbyResult.data,
						zoom,
						bounds,
						effectiveCenter,
						route,
					)
					return
				}
			}
		}

		// Debug: Mostrar muestra de coordenadas
		if (filteredBins.length > 0) {
			const sample = filteredBins.slice(0, 5).map(b => ({
				id: b.properties.binId,
				coords: b.geometry.coordinates,
			}))
			console.log('📍 [BINS_DISPLAY] Sample coordinates:', sample)
		}

		applyFilteredBins(filteredBins)
		console.timeEnd(`⏱️ [BINS_DISPLAY] total-${binType}`)
	} catch (error) {
		console.timeEnd(`⏱️ [BINS_DISPLAY] total-${binType}`)
		console.error(`❌ [BINS_DISPLAY] Error showing individual bins:`, error)
	}
}

/**
 * Muestra bins cercanos (nearby) sin cachear en SQLite
 * Aplica muestreo proporcional al área visible
 * @param binType - Tipo de contenedor
 * @param nearbyBins - Bins descargados del endpoint /nearby
 * @param zoom - Nivel de zoom actual
 * @param bounds - Límites del viewport
 * @param center - Centro del viewport
 * @param route - Ruta activa (opcional)
 */
export const showNearbyBins = (
	binType: BinType,
	nearbyBins: any[],
	zoom: number,
	bounds: any,
	center: any,
	route: any = null,
): void => {
	try {
		console.log(
			`🎯 [NEARBY_DISPLAY] Showing ${nearbyBins.length} nearby bins for ${binType} at zoom ${zoom}`,
		)

		// Convertir bins a formato GeoJSON (sin cachear)
		const geoJsonBins = nearbyBins.map(bin => ({
			type: 'Feature' as const,
			geometry: {
				type: 'Point' as const,
				coordinates: [bin.lng, bin.lat] as [number, number],
			},
			properties: {
				binId: `bin-${bin.id}`,
				binType: binType,
				cluster: false,
				category_group_id: bin.category_group_id,
				category_id: bin.category_id,
				district_code: bin.district_code,
				neighborhood_code: bin.neighborhood_code,
				address: bin.address,
				lat: bin.lat,
				lng: bin.lng,
				load_type: bin.load_type,
				direction: bin.direction,
				subtype: bin.subtype,
				placement_type: bin.placement_type,
				notes: bin.notes,
				bus_stop: bin.bus_stop,
				interurban_node: bin.interurban_node,
			},
		})) as BinPoint[]

		// Aplicar muestreo proporcional al área visible
		const sampledBins = filterPointsForViewport(
			geoJsonBins,
			zoom,
			bounds,
			center,
			route,
		)

		console.log(
			`✅ [NEARBY_DISPLAY] Sampled ${geoJsonBins.length} → ${sampledBins.length} nearby bins`,
		)

		// Actualizar stores (solo en memoria)
		const { setAllPoints, setFilteredPoints } = useMapBinsStore.getState()
		const { setPointsCache } = useBinsCacheStore.getState()

		// Guardar para que showIndividualBins los encuentre
		setPointsCache(binType, geoJsonBins)

		setAllPoints(geoJsonBins)
		setFilteredPoints(sampledBins)
	} catch (error) {
		console.error(`❌ [NEARBY_DISPLAY] Error showing nearby bins:`, error)
	}
}
