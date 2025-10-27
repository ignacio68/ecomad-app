import { BinType } from '@/shared/types/bins'
import {
	CLUSTER_SIZE_THRESHOLD_MEDIUM,
	CLUSTER_SIZE_THRESHOLD_SMALL,
} from '@map/constants/clustering'
import { CircleLayer, ShapeSource, SymbolLayer } from '@rnmapbox/maps'
import React from 'react'

interface MapClusterMarkerProps {
	cluster: any
	onPress?: (cluster: any) => void
}

const MapClusterMarker: React.FC<MapClusterMarkerProps> = ({ cluster, onPress }) => {
	const { point_count, binType } = cluster.properties
	const [longitude, latitude] = cluster.geometry.coordinates

	const handleClusterMarkerPress = () => onPress?.(cluster)

	// Crear GeoJSON para el cluster
	const clusterGeoJSON = {
		type: 'FeatureCollection' as const,
		features: [{
			type: 'Feature' as const,
			geometry: cluster.geometry,
			properties: {
				...cluster.properties,
				point_count,
				binType,
			},
		}],
	}

	// Calcular tamaño del cluster basado en el número de puntos
	const getClusterSize = (count: number) => {
		if (count < CLUSTER_SIZE_THRESHOLD_SMALL) {
			return 16
		} else if (count < CLUSTER_SIZE_THRESHOLD_MEDIUM) {
			return 20
		} else {
			return 24
		}
	}
	const getClusterColor = (count: number) => {
		if (count < CLUSTER_SIZE_THRESHOLD_SMALL) {
			return '#a8002d'
		} else if (count < CLUSTER_SIZE_THRESHOLD_MEDIUM) {
			return '#800020'
		} else {
			return '#640017'
		}
	}

	const getFontSize = (count: number) => {
		if (count < CLUSTER_SIZE_THRESHOLD_SMALL) {
			return 12
		} else if (count < CLUSTER_SIZE_THRESHOLD_MEDIUM) {
			return 14
		} else {
			return 16
		}
	}

	return (
		<ShapeSource
			id={`cluster-${cluster.id}`}
			shape={clusterGeoJSON}
			onPress={handleClusterMarkerPress}
			hitbox={{ width: 44, height: 44 }}
		>
			<CircleLayer
				id={`cluster-circle-${cluster.id}`}
				style={{
					circleRadius: getClusterSize(point_count),
					circleColor: getClusterColor(point_count),
					circleStrokeWidth: 2,
					circleStrokeColor: '#ffffff',
					circleOpacity: 0.8,
				}}
			/>
			<SymbolLayer
				id={`cluster-text-${cluster.id}`}
				style={{
					textField: ['get', 'point_count'],
					textSize: getFontSize(point_count),
					textColor: '#ffffff',
					textFont: ['Open Sans Bold'],
				}}
			/>
		</ShapeSource>
	)
}

export default MapClusterMarker
