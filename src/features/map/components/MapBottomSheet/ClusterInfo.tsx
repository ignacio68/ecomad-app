import { Text, View } from 'react-native'
import { ClusterFeature } from '@map/types/mapData'

interface ClusterInfoProps {
	cluster: ClusterFeature
}

const ClusterInfo: React.FC<ClusterInfoProps> = ({ cluster }) => {
	const { point_count, point_count_abbreviated, binType } = cluster.properties
	const [longitude, latitude] = cluster.geometry.coordinates

	return (
		<View className="w-full px-2 py-6">
			<Text className="text-sm font-lato-semibold text-gray-500">
				Cluster seleccionado
			</Text>
			<Text className="mt-2 text-3xl font-lato-bold text-gray-900">
				{point_count_abbreviated ?? point_count}
				<Text className="text-lg font-lato-semibold text-gray-600">
					{' '}
					contenedores en la zona seleccionada
				</Text>
			</Text>
			{/* {binType && (
				<Text className="mt-1 text-base font-lato-regular text-gray-700">
					Tipo principal: {binType.replace('_', ' ')}
				</Text>
			)} */}
			<View className="mt-4 flex-row justify-start gap-2">
				<Text className="text-xs font-lato-regular  uppercase text-gray-500">Coordenadas</Text>
				<Text className="text-xs font-lato-medium text-gray-700">
					{latitude.toFixed(5)} / {longitude.toFixed(5)}
				</Text>
			</View>
		</View>
	)
}

export default ClusterInfo
