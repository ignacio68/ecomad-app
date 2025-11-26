import { Text, View } from 'react-native'

interface GeneralInfoProps {
	mapBottomSheetTitle: string
	totalBins: number | null
}

const GeneralInfo = ({ mapBottomSheetTitle, totalBins }: GeneralInfoProps) => {
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
			<Text className="text-center font-lato-regular text-lg">
				{getTotalCountText(totalBins)}
			</Text>
		</View>
	)
}

export default GeneralInfo
