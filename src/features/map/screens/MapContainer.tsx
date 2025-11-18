import MapBase from '@map/components/MapBase'
import MapBottomSheet from '@map/components/MapBottomSheet/MapBottomSheet'
import MapChipsContainer from '@map/components/MapChipsContainer/MapChipsContainer'
import MapFABsRightContainer from '@/features/map/components/MapFABsRightContainer/MapFABsRightContainer'
import { createChipsList } from '@map/constants/chips'
import { useMapBottomSheetStore } from '@map/stores/mapBottomSheetStore'
import { memo, useMemo } from 'react'
import { View } from 'react-native'

const MapContainer = memo(() => {
	const { isMapBottomSheetOpen, setIsMapBottomSheetOpen } =
		useMapBottomSheetStore()

	const chipsList = useMemo(() => createChipsList(), [])

	const handleChipPress = () => setIsMapBottomSheetOpen(true)

	return (
		<View className="flex-1 bg-primary">
			<MapBase />
			<MapChipsContainer
				chips={chipsList}
				containerClassName="absolute left-0 right-0 top-16"
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
