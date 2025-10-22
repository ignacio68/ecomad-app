import { BinType } from '@/shared/types/bins'
import {
	CLUSTER_MAX_ZOOM,
	CLUSTER_MIN_ZOOM,
	CLUSTER_RADIUS,
	CLUSTER_USE_UNTIL_ZOOM,
	MIN_CLUSTER_SIZE,
	SUPERCLUSTER_EXTENT,
	SUPERCLUSTER_NODE_SIZE,
} from '@map/constants/clustering'
import { useMapClustersStore } from '@map/stores/mapClustersStore'
import { BinPoint, LngLatBounds, MapZoomLevels } from '@map/types/mapData'
import Supercluster from 'supercluster'

// Función helper para expandir clusters pequeños
const expandCluster = (
	cluster: any,
	supercluster: Supercluster,
): BinPoint[] => {
	try {
		const clusterId = cluster.properties.cluster_id
		const leaves = supercluster.getLeaves(clusterId, Infinity)
		return leaves as BinPoint[]
	} catch (error) {
		console.error('❌ Error expanding cluster:', error)
		return []
	}
}

// Función pura para determinar si un cluster debe expandirse
const shouldExpandCluster = (feature: any, validatedZoom: number): boolean => {
	const count = feature.properties.point_count ?? 0
	return (
		count > 0 &&
		(count <= MIN_CLUSTER_SIZE || validatedZoom >= MapZoomLevels.CLUSTER)
	)
}

/**
 * Calcula clusters de forma imperativa y los guarda en el store
 */
export const calculateAndStoreClusters = (
	filteredPoints: BinPoint[],
	zoom: number,
	bounds: LngLatBounds | null,
): void => {
	console.log('🎯 [CLUSTERING] Starting calculation', {
		points: filteredPoints.length,
		zoom,
		hasBounds: !!bounds,
	})

	const { setDisplayClusters, setSuperclusterInstance } =
		useMapClustersStore.getState()

	// Si no hay puntos, limpiar
	if (filteredPoints.length === 0) {
		console.log('🎯 [CLUSTERING] No points, clearing clusters')
		setDisplayClusters([])
		setSuperclusterInstance(null)
		return
	}

	// Determinar si usar clustering
	const shouldUseSupercluster = zoom <= CLUSTER_USE_UNTIL_ZOOM

	// Sin clustering: mostrar puntos individuales
	if (!shouldUseSupercluster) {
		console.log(
			'🎯 [CLUSTERING] No clustering needed, showing individual points',
		)
		const individualPoints = filteredPoints.filter(
			(point: BinPoint) => !point.properties.cluster,
		)
		setDisplayClusters(individualPoints)
		setSuperclusterInstance(null)
		return
	}

	// Con clustering: usar Supercluster
	try {
		const supercluster = new Supercluster({
			radius: CLUSTER_RADIUS,
			maxZoom: CLUSTER_MAX_ZOOM,
			minZoom: CLUSTER_MIN_ZOOM,
			extent: SUPERCLUSTER_EXTENT,
			nodeSize: SUPERCLUSTER_NODE_SIZE,
			map: (props: { binType: BinType }) => ({
				binType: props.binType,
				count: 1,
			}),
			reduce: (
				acc: { count: number; binType?: BinType },
				props: { binType: BinType },
			) => {
				acc.count += 1
				if (!acc.binType) {
					acc.binType = props.binType
				}
				return acc
			},
		})

		// Cargar puntos
		supercluster.load(filteredPoints)

		// Calcular clusters para el viewport actual
		const clusterBounds = bounds
			? [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]]
			: undefined

		const clusters = supercluster.getClusters(
			clusterBounds as [number, number, number, number],
			Math.floor(zoom),
		)

		console.log('🎯 [CLUSTERING] Clusters calculated:', {
			input: filteredPoints.length,
			output: clusters.length,
		})

		// Expandir clusters pequeños
		const resolved: BinPoint[] = []

		for (const feature of clusters) {
			if (feature.properties?.cluster && shouldExpandCluster(feature, zoom)) {
				const expandedLeaves = expandCluster(feature, supercluster)
				resolved.push(...expandedLeaves)
			} else {
				resolved.push(feature as BinPoint)
			}
		}

		console.log('🎯 [CLUSTERING] After expanding small clusters:', {
			before: clusters.length,
			after: resolved.length,
		})

		// Guardar en store (sin excluir el seleccionado; la UI decide apariencia)
		setDisplayClusters(resolved)
		setSuperclusterInstance(supercluster)
	} catch (error) {
		console.error('❌ [CLUSTERING] Error:', error)
		setDisplayClusters([])
		setSuperclusterInstance(null)
	}
}
