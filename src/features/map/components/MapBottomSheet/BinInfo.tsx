import { HugeiconsIcon } from '@hugeicons/react-native'
import { Pressable, Text, View } from 'react-native'
import type { BinPoint } from '../../hooks/useSuperclusterBins'

interface BinInfoProps {
	bin: BinPoint
	onNavigate?: (bin: BinPoint) => void
}

const BinInfo: React.FC<BinInfoProps> = ({ bin, onNavigate }) => {
	const {
		properties: { direccion, distrito, barrio, binType },
		geometry: { coordinates },
	} = bin

	const [longitude, latitude] = coordinates

	return (
		<View className="w-full px-8 py-6">
			<Text className="text-sm font-lato-mediumsemibold uppercase text-gray-500">
				Contenedor seleccionado
			</Text>
			<Text className="mt-2 text-2xl font-lato-bold text-gray-900">{direccion}</Text>
			<Text className="mt-1 text-base font-lato-medium text-gray-700">
				{distrito} · {barrio}
			</Text>
			<Text className="mt-1 text-sm font-lato-medium text-gray-500">Tipo: {binType}</Text>

			<View className="mt-4 flex-row justify-between">
				<Text className="text-xs font-lato-medium uppercase text-gray-500">Coordenadas</Text>
				<Text className="text-xs font-lato-medium text-gray-700">
					{latitude.toFixed(5)} / {longitude.toFixed(5)}
				</Text>
			</View>

			<Pressable
				className="mt-6 flex-row items-center justify-center rounded-full bg-gray-300 px-4 py-3"
				onPress={() => onNavigate?.(bin)}
			>
				<Text className="ml-2 text-base font-semibold text-white">
					Cómo llegar
				</Text>
			</Pressable>
		</View>
	)
}

export default BinInfo
