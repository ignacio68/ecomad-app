import { BinType } from '@/shared/types/bins'
import {
	CLUSTER_SIZE_THRESHOLD_MEDIUM,
	CLUSTER_SIZE_THRESHOLD_SMALL,
} from '@map/constants/clustering'
import { MarkerView } from '@rnmapbox/maps'
import React from 'react'
import { Pressable, Text, View } from 'react-native'

interface ClusterMarkerProps {
	cluster: any
	onPress?: (cluster: any) => void
}

// Funciones helper definidas primero
const getClusterClassName = (count: number, binType: BinType) => {
	if (count < CLUSTER_SIZE_THRESHOLD_SMALL) {
		return `w-12 h-12 rounded-full bg-clothing_bins-600 border-2 border-white flex items-center justify-center`
	} else if (count < CLUSTER_SIZE_THRESHOLD_MEDIUM) {
		return `w-14 h-14 rounded-full bg-clothing_bins-700 border-2 border-white flex items-center justify-center`
	} else {
		return `w-16 h-16 rounded-full bg-clothing_bins-800 border-2 border-white flex items-center justify-center`
	}
}

const getTextClassName = (count: number) => {
	if (count < CLUSTER_SIZE_THRESHOLD_SMALL) {
		return 'text-xs font-lato-bold text-white'
	} else if (count < CLUSTER_SIZE_THRESHOLD_MEDIUM) {
		return 'text-sm font-lato-bold text-white'
	} else {
		return 'text-base font-lato-bold text-white'
	}
}

const ClusterMarker: React.FC<ClusterMarkerProps> = React.memo(
	({ cluster, onPress }) => {
		const { point_count, binType } = cluster.properties
		const [longitude, latitude] = cluster.geometry.coordinates

		// Manejar el clic del PointAnnotation
		const handlePointAnnotationPress = () => onPress?.(cluster)

		return (
			<MarkerView
				coordinate={[longitude, latitude]}
				anchor={{ x: 0.5, y: 0.5 }}
			>
				<Pressable onPress={handlePointAnnotationPress}>
					<View
						className={getClusterClassName(point_count, binType)}
						collapsable={false}
					>
						<Text className="text-lg font-bold text-white">{point_count}</Text>
					</View>
				</Pressable>
			</MarkerView>
		)
	},
)

export default ClusterMarker
