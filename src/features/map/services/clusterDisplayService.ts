import { BinsService } from '@/db/bins/service'
import type { BinType } from '@/shared/types/bins'
import {
	filterPointsForViewport,
	loadContainersAsGeoJSON,
} from '@map/services/binsLoader'
import { HierarchicalClusteringService } from '@map/services/hierarchicalClusteringService'
import { useMapBinsStore } from '@map/stores/mapBinsStore'
import { useMapClustersStore } from '@map/stores/mapClustersStore'
import { useSuperclusterCacheStore } from '@map/stores/superclusterCacheStore'
import type { BinPoint } from '@map/types/mapData'

/**
 * Servicio para mostrar clusters o bins en el mapa
 * Separa la lógica de visualización de la lógica de carga de datos
 */

/**
 * Muestra clusters jerárquicos (distritos o barrios) según el zoom
 * @param binType - Tipo de contenedor
 * @param zoom - Nivel de zoom actual
 */
export const showHierarchicalClusters = async (
	binType: BinType,
	zoom: number,
): Promise<void> => {
	try {
		console.log(
			`🎯 [CLUSTER_DISPLAY] Showing hierarchical clusters for ${binType} at zoom ${zoom}`,
		)

		// Obtener hierarchyData de BD (ya debe estar cacheada)
		const hierarchyData = await BinsService.getHierarchyData(binType)

		if (!hierarchyData || hierarchyData.length === 0) {
			console.warn(
				`⚠️ [CLUSTER_DISPLAY] No hierarchy data available for ${binType}`,
			)
			return
		}

		// Debug: Mostrar muestra de hierarchyData
		console.log(
			`🔍 [CLUSTER_DISPLAY] HierarchyData sample:`,
			JSON.stringify(hierarchyData.slice(0, 3), null, 2),
		)

		// Crear clusters según zoom
		const clusters = HierarchicalClusteringService.createClusters(
			hierarchyData,
			zoom,
			binType,
		)

		console.log(
			`✅ [CLUSTER_DISPLAY] Created ${clusters.length} clusters (zoom: ${zoom})`,
		)

		// Actualizar store
		const { setDisplayClusters } = useMapClustersStore.getState()
		const clusterPoints = clusters as unknown as BinPoint[]
		setDisplayClusters(clusterPoints)
	} catch (error) {
		console.error(`❌ [CLUSTER_DISPLAY] Error showing clusters:`, error)
	}
}

/**
 * Muestra bins individuales filtrados por viewport
 * Se usa cuando zoom >= 14
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
		console.log(
			`🎯 [BINS_DISPLAY] Showing individual bins for ${binType} at zoom ${zoom}`,
		)
		console.log(`🔍 [BINS_DISPLAY] Bounds:`, bounds)
		console.log(`🔍 [BINS_DISPLAY] Center:`, center)

		// Obtener cache persistente del store
		const { getPointsCache, setPointsCache } =
			useSuperclusterCacheStore.getState()

		// Verificar si ya tenemos los bins en cache
		const cachedBins = getPointsCache(binType)
		let allBins: any[]

		if (cachedBins && cachedBins.length > 0) {
			console.log(
				`✅ [BINS_DISPLAY] Using cached bins: ${cachedBins.length} bins`,
			)
			allBins = cachedBins
		} else {
			console.log(`📥 [BINS_DISPLAY] Loading bins from database...`)
			// Crear objeto cache compatible con loadContainersAsGeoJSON
			const binsCache = {
				get: getPointsCache,
				set: setPointsCache,
				clear: () => {},
			}
			allBins = await loadContainersAsGeoJSON(binType, binsCache)
			console.log(`📦 [BINS_DISPLAY] Loaded and cached ${allBins.length} bins`)
		}

		// Filtrar por viewport
		const filteredBins = filterPointsForViewport(
			allBins,
			zoom,
			bounds,
			center,
			route,
		)

		console.log(
			`✅ [BINS_DISPLAY] Filtered ${allBins.length} → ${filteredBins.length} bins`,
		)

		// Debug: Mostrar muestra de coordenadas
		if (filteredBins.length > 0) {
			const sample = filteredBins.slice(0, 5).map(b => ({
				id: b.properties.containerId,
				coords: b.geometry.coordinates,
			}))
			console.log('📍 [BINS_DISPLAY] Sample coordinates:', sample)
		}

		// Actualizar stores
		const { setAllPoints, setFilteredPoints } = useMapBinsStore.getState()
		const { setDisplayClusters } = useMapClustersStore.getState()

		setAllPoints(allBins)
		setFilteredPoints(filteredBins)
		setDisplayClusters(filteredBins)
	} catch (error) {
		console.error(`❌ [BINS_DISPLAY] Error showing individual bins:`, error)
	}
}

/**
 * Muestra bins cercanos (nearby) sin cachear en SQLite
 * Se usa cuando zoom >= 14 y SQLite está vacía (primera carga)
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
				containerId: `bin-${bin.id}`,
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

		// NO filtrar por viewport - los bins ya están filtrados por nearby (1km radio)
		// Mostrar todos los bins nearby sin filtro adicional
		const filteredBins = geoJsonBins

		console.log(
			`✅ [NEARBY_DISPLAY] Filtered ${geoJsonBins.length} → ${filteredBins.length} nearby bins`,
		)

		// Actualizar stores (solo en memoria)
		const { setAllPoints, setFilteredPoints } = useMapBinsStore.getState()
		const { setDisplayClusters } = useMapClustersStore.getState()

		setAllPoints(geoJsonBins)
		setFilteredPoints(filteredBins)
		setDisplayClusters(filteredBins)
	} catch (error) {
		console.error(`❌ [NEARBY_DISPLAY] Error showing nearby bins:`, error)
	}
}
