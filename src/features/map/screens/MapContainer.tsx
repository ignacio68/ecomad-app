import MapBase from '@map/components/MapBase'
import MapBottomSheet from '@map/components/MapBottomSheet/MapBottomSheet'
import MapChipsContainer from '@map/components/MapChipsContainer/MapChipsContainer'
import MapFABsRightContainer from '@map/components/MapFABsRightContainer'
import { createChipsList } from '@map/constants/chips'
import { useMapBottomSheetStore } from '@map/stores/mapBottomSheetStore'
import { memo, useCallback, useMemo } from 'react'
import { View } from 'react-native'

const MapContainer = memo(() => {
	const { isMapBottomSheetOpen, setIsMapBottomSheetOpen } =
		useMapBottomSheetStore()

	const chipsList = useMemo(() => createChipsList(), [])

	const handleChipPress = useCallback((chipId: string, title: string) => {
		setIsMapBottomSheetOpen(true)
	}, [])

	return (
		<View className="flex-1">
			<MapBase />
			<MapChipsContainer
				chips={chipsList}
				containerClassName="absolute left-0 right-0 top-16" // TODO: Convertir a constante
				scrollViewClassName="px-4 py-2"
				onChipPress={handleChipPress}
			/>
			<MapFABsRightContainer />
			<MapBottomSheet isOpen={isMapBottomSheetOpen} />
		</View>
	)
})

MapContainer.displayName = 'MapContainer'

export default MapContainer
