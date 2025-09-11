import React, { useCallback, useEffect, useMemo } from 'react'
import { View } from 'react-native'
import MapBase from '../components/MapBase'
import MapBottomSheet from '../components/MapBottomSheet/MapBottomSheet'
import MapChipsContainer from '../components/MapChipsContainer'
import MapFABsRightContainer from '../components/MapFABsRightContainer'
import { createChipsList } from '../constants/chips'
import { setMapboxAccessToken } from '../services/mapService'
import { useMapBottomSheetStore } from '../stores/mapBottomSheetStore'

const MapContainer = React.memo(() => {
	const { isMapBottomSheetOpen, setIsMapBottomSheetOpen } =
		useMapBottomSheetStore()

	useEffect(() => {
		setMapboxAccessToken()
	}, [])

	const chipsList = useMemo(() => createChipsList(), [])

	const handleChipPress = useCallback((chipId: string, title: string) => {
		setIsMapBottomSheetOpen(true)
	}, [])

	const chipsContent = useMemo(
		() => (
			<MapChipsContainer
				chips={chipsList}
				containerClassName="absolute left-0 right-0 top-16"
				scrollViewClassName="px-4 py-2"
				onChipPress={handleChipPress}
			/>
		),
		[chipsList, handleChipPress],
	)

	return (
		<View className="flex-1">
			<MapBase />
			{chipsContent}
			<MapFABsRightContainer />
			<MapBottomSheet isOpen={isMapBottomSheetOpen} />
		</View>
	)
})

MapContainer.displayName = 'MapContainer'

export default MapContainer
