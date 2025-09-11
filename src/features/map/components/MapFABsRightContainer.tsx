import FAB from '@/shared/components/ui/buttons/FAB'
import { LocationUser03Icon } from '@hugeicons-pro/core-duotone-rounded'
import React from 'react'
import { View } from 'react-native'
import { useMapStore } from '../stores/mapStore'
import { useLocationStore } from '../stores/userLocationStore'

const MapFABsRightContainer = React.memo(() => {
	const { isUserLocationFABActivated, setIsUserLocationFABActivated } =
		useMapStore()
	const { setPermissions } = useLocationStore()

	const userLocationFABActivated = async () => {
		if (!isUserLocationFABActivated) {
			const ok = await setPermissions(true)
			if (!ok) return
		}
		setIsUserLocationFABActivated(!isUserLocationFABActivated)
	}

	return (
		<View className="flex-column absolute right-4 top-52 h-14 w-14 items-end justify-center">
			<FAB
				name="userLocation"
				icon={LocationUser03Icon}
				iconSelected={LocationUser03Icon}
				isSelected={isUserLocationFABActivated}
				onPress={userLocationFABActivated}
			/>
		</View>
	)
})

export default MapFABsRightContainer
