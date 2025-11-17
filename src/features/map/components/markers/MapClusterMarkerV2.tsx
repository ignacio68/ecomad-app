import { BinType } from '@/shared/types/bins'
import type { ClusterLevel } from '@map/services/hierarchicalClusteringService'
import { HierarchicalClusteringService } from '@map/services/hierarchicalClusteringService'
import { CircleLayer, ShapeSource, SymbolLayer } from '@rnmapbox/maps'
import React from 'react'

interface MapClusterMarkerV2Props {
	cluster: any
	onPress?: (cluster: any) => void
}

const MapClusterMarkerV2: React.FC<MapClusterMarkerV2Props> = ({
	cluster,
	onPress,
}) => {
	const { point_count, binType, clusterLevel } = cluster.properties
	const clusterLevelValue = (clusterLevel || 'neighborhood') as ClusterLevel

	const handleClusterMarkerPress = () => onPress?.(cluster)

	// Crear GeoJSON para el cluster
	const clusterGeoJSON = {
		type: 'FeatureCollection' as const,
		features: [
			{
				type: 'Feature' as const,
				geometry: cluster.geometry,
				properties: {
					...cluster.properties,
					point_count,
					binType,
					clusterLevel: clusterLevelValue,
				},
			},
		],
	}

	// Usar el servicio para calcular tamaño, color y fuente
	const clusterSize = HierarchicalClusteringService.getClusterSize(point_count)
	const clusterColor = HierarchicalClusteringService.getClusterColor(
		clusterLevelValue,
		binType as BinType,
		'medium', // Tamaño medio por defecto
	)
	const fontSize = HierarchicalClusteringService.getClusterFontSize(point_count)

	return (
		<ShapeSource
			id={`cluster-${cluster.properties.cluster_id || cluster.id}`}
			shape={clusterGeoJSON}
			onPress={handleClusterMarkerPress}
			hitbox={{ width: 44, height: 44 }}
		>
			<CircleLayer
				id={`cluster-circle-${cluster.properties.cluster_id || cluster.id}`}
				style={{
					circleRadius: clusterSize,
					circleColor: clusterColor,
					circleStrokeWidth: 2,
					circleStrokeColor: '#ffffff',
					circleOpacity: 0.9,
				}}
			/>
			<SymbolLayer
				id={`cluster-text-${cluster.properties.cluster_id || cluster.id}`}
				style={{
					textField: ['get', 'point_count'],
					textSize: fontSize,
					textColor: '#ffffff',
					textFont: ['Open Sans Bold'],
				}}
			/>
		</ShapeSource>
	)
}

export default MapClusterMarkerV2
