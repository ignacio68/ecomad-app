import { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { ClusterFeature } from '@map/types/mapData'
import { Text, View } from 'react-native'

interface ClusterInfoProps {
	cluster: ClusterFeature
}

const ClusterInfo = ({ cluster }: ClusterInfoProps) => {
	const { point_count, point_count_abbreviated, binType } = cluster.properties
	const [longitude, latitude] = cluster.geometry.coordinates

	return (
		<BottomSheetScrollView className="w-full px-2 py-6">
			<Text className="font-lato-semibold text-sm text-gray-500">
				Cluster seleccionado
			</Text>
			<Text className="mt-2 font-lato-bold text-3xl text-gray-900">
				{point_count_abbreviated ?? point_count}
				<Text className="font-lato-semibold text-lg text-gray-600">
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
				<Text className="font-lato-regular text-xs  uppercase text-gray-500">
					Coordenadas
				</Text>
				<Text className="font-lato-medium text-xs text-gray-700">
					{latitude.toFixed(5)} / {longitude.toFixed(5)}
				</Text>
			</View>
		</BottomSheetScrollView>
	)
}

export default ClusterInfo
