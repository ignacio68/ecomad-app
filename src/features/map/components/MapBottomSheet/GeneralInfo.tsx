import { Text, View } from 'react-native'

const GeneralInfo = ({
	mapBottomSheetTitle,
	totalBins,
}: {
	mapBottomSheetTitle: string
	totalBins: number | null
}) => {
	const getTotalCountText = (totalBins: number | null) => {
		if (totalBins == null) {
			return `Cargando información de contenedores de ${mapBottomSheetTitle}...`
		}
		return totalBins > 0
			? `En Madrid hay ${totalBins.toLocaleString()} contenedores de ${mapBottomSheetTitle}`
			: `Madrid no dispone de contenedores de ${mapBottomSheetTitle}`
	}
	return (
		<View className="flex-1 items-center justify-center">
			<Text className="font-lato-regular text-center text-lg">
				{getTotalCountText(totalBins)}
			</Text>
		</View>
	)
}

export default GeneralInfo
