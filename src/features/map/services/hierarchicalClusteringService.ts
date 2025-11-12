import type { HierarchyData } from '@/db/bins/service'
import { DISTRICTS } from '@/shared/constants/districts'
import type { BinType } from '@/shared/types/bins'
import { BIN_MARKER_ICONS } from '@map/constants/binMarkerIcons'

/**
 * Tipo de cluster jerárquico
 */
export type ClusterLevel = 'district' | 'neighborhood'

/**
 * Feature de cluster jerárquico (compatible con BinPoint pero con propiedades de cluster)
 */
export interface HierarchicalClusterFeature {
	type: 'Feature'
	geometry: {
		type: 'Point'
		coordinates: [number, number]
	}
	properties: {
		cluster: true
		cluster_id: string
		point_count: number
		binType: BinType
		clusterLevel: ClusterLevel
		districtId?: number
		neighborhoodId?: number
		districtName?: string
		neighborhoodName?: string
	}
}

/**
 * Agrupa hierarchyData por distrito
 */
const groupByDistrict = (
	hierarchyData: HierarchyData[],
): Map<string, number> => {
	const districtCounts = new Map<string, number>()

	for (const item of hierarchyData) {
		const districtId = item.distrito
		const currentCount = districtCounts.get(districtId) || 0
		districtCounts.set(districtId, currentCount + item.count)
	}

	return districtCounts
}

/**
 * Crea clusters por distrito
 */
const createDistrictClusters = (
	hierarchyData: HierarchyData[],
	binType: BinType,
): HierarchicalClusterFeature[] => {
	const districtCounts = groupByDistrict(hierarchyData)
	const clusters: HierarchicalClusterFeature[] = []

	for (const [districtCode, count] of districtCounts.entries()) {
		// El código ya viene con formato correcto "01", "02"... del backend

		// Buscar centroide en DISTRICTS
		const district = DISTRICTS.find(d => d.district_id === districtCode)

		if (!district || count === 0) {
			continue // Saltar si no encontramos el distrito o no hay contenedores
		}

		clusters.push({
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [district.centroid.lng, district.centroid.lat],
			},
			properties: {
				cluster: true,
				cluster_id: `district-${districtCode}`,
				point_count: count,
				binType,
				clusterLevel: 'district',
				districtId: Number.parseInt(districtCode),
				districtName: district.nom_dis,
			},
		})
	}

	console.log(`✅ [HIERARCHICAL] Created ${clusters.length} district clusters`)
	return clusters
}

/**
 * Crea clusters por barrio
 * Los items sin barrio se agrupan como clusters de distrito
 */
const createNeighborhoodClusters = (
	hierarchyData: HierarchyData[],
	binType: BinType,
): HierarchicalClusterFeature[] => {
	const clusters: HierarchicalClusterFeature[] = []
	const districtOnlyItems: HierarchyData[] = []

	console.log('🔍 [HIERARCHICAL] Creating neighborhood clusters from data:', {
		hierarchyDataLength: hierarchyData.length,
		sampleItem: hierarchyData[0],
	})

	for (const item of hierarchyData) {
		if (item.count === 0) continue

		// El backend ya devuelve códigos formateados: distrito="01", barrio="011"
		const districtCode = item.distrito
		const neighborhoodCode = item.barrio

		// Si no hay barrio, guardar para agrupar por distrito después
		if (!neighborhoodCode || neighborhoodCode === '') {
			districtOnlyItems.push(item)
			continue
		}

		// Buscar distrito por district_id (ya viene con formato "01", "02"...)
		const district = DISTRICTS.find(d => d.district_id === districtCode)
		if (!district) {
			console.warn(`⚠️ [HIERARCHICAL] District not found: ${districtCode}`)
			continue
		}

		// Buscar barrio por neighborhood_id (ya viene con formato "011", "024"...)
		const neighborhood = district.barrios.find(
			b => b.neighborhood_id === neighborhoodCode,
		)
		if (!neighborhood) {
			console.warn(
				`⚠️ [HIERARCHICAL] Neighborhood not found: ${neighborhoodCode} (district=${districtCode})`,
			)
			continue
		}

		clusters.push({
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [neighborhood.centroid.lng, neighborhood.centroid.lat],
			},
			properties: {
				cluster: true,
				cluster_id: `neighborhood-${neighborhood.neighborhood_id}`,
				point_count: item.count,
				binType,
				clusterLevel: 'neighborhood',
				districtId: Number.parseInt(districtCode),
				neighborhoodId: Number.parseInt(neighborhood.neighborhood_id),
				districtName: district.nom_dis,
				neighborhoodName: neighborhood.nom_bar,
			},
		})
	}

	// Agrupar items sin barrio por distrito
	if (districtOnlyItems.length > 0) {
		console.log(
			`🔍 [HIERARCHICAL] Creating district clusters for ${districtOnlyItems.length} items without neighborhood`,
		)
		const districtClusters = createDistrictClusters(districtOnlyItems, binType)
		clusters.push(...districtClusters)
	}

	console.log(
		`✅ [HIERARCHICAL] Created ${clusters.length} clusters (neighborhoods + districts without barrio)`,
	)
	return clusters
}

/**
 * Servicio de clustering jerárquico
 * Crea clusters basados en datos de jerarquía (distritos/barrios)
 */
export const HierarchicalClusteringService = {
	/**
	 * Crea clusters jerárquicos según el nivel de zoom
	 * SOLO clusters de distrito - NO usamos clusters de barrio
	 */
	createClusters: (
		hierarchyData: HierarchyData[],
		zoom: number,
		binType: BinType,
	): HierarchicalClusterFeature[] => {
		// SIEMPRE crear clusters de distrito
		// A partir de zoom 14, se mostrarán bins individuales (no clusters)
		console.log('🎯 [HIERARCHICAL] Creating district clusters')
		return createDistrictClusters(hierarchyData, binType)
	},

	/**
	 * Obtiene el color del cluster según el nivel y binType
	 */
	getClusterColor: (
		clusterLevel: ClusterLevel,
		binType: BinType,
		size: 'small' | 'medium' | 'large',
	): string => {
		const iconSet = BIN_MARKER_ICONS[binType]

		if (clusterLevel === 'district') {
			return iconSet.highColor // Distrito = color oscuro
		}

		if (clusterLevel === 'neighborhood') {
			return iconSet.mediumColor // Barrio = color medio
		}

		// Fallback (no debería llegar aquí)
		return iconSet.color
	},

	/**
	 * Calcula el tamaño del cluster basado en el número de contenedores
	 */
	getClusterSize: (count: number): number => {
		if (count < 10) return 16
		if (count < 50) return 20
		if (count < 100) return 24
		if (count < 500) return 28
		return 32
	},

	/**
	 * Calcula el tamaño de fuente para el texto del cluster
	 */
	getClusterFontSize: (count: number): number => {
		if (count < 10) return 10
		if (count < 50) return 12
		if (count < 100) return 14
		if (count < 500) return 16
		return 18
	},
}
