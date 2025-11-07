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
