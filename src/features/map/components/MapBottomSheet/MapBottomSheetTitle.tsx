import { InformationCircleIcon } from '@hugeicons-pro/core-stroke-rounded'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useMapBottomSheetStore } from '@map/stores/mapBottomSheetStore'
import { useMapChipsMenuStore } from '@map/stores/mapChipsMenuStore'
import { useMapNavigationStore } from '@map/stores/mapNavigationStore'
import { MarkerType } from '@map/types/mapData'
import { memo, useCallback, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import Popover from 'react-native-popover-view'

const MapBottomSheetTitle = memo(({ title }: { title: string }) => {
	const { setIsMapBottomSheetOpen, markerState, reset, setMarkerType } =
		useMapBottomSheetStore()
	const { clearChip } = useMapChipsMenuStore()
	const { deactivateRouteIfActive } = useMapNavigationStore()
	const [isDataOwnerInfoOpen, setIsDataOwnerInfoOpen] = useState(false)

	const handleClose = useCallback(() => {
		if (markerState.markerType === MarkerType.GENERAL) {
			setIsMapBottomSheetOpen(false)
			clearChip()
		} else {
			deactivateRouteIfActive()
			setMarkerType(MarkerType.GENERAL)
			reset()
		}
	}, [
		clearChip,
		deactivateRouteIfActive,
		markerState.markerType,
		reset,
		setIsMapBottomSheetOpen,
		setMarkerType,
	])

	const handleDataOwnerInfo = useCallback(() => {
		deactivateRouteIfActive()
		setIsDataOwnerInfoOpen(true)
	}, [deactivateRouteIfActive])

	return (
		<View className="w-full">
			<View className="flex-row items-center justify-between px-2 py-4">
				<View className="flex-1 flex-row items-center">
					<Text className="font-lato-semibold text-2xl text-gray-900">
						{title}
					</Text>
					<Popover
						isVisible={isDataOwnerInfoOpen}
						onRequestClose={() => setIsDataOwnerInfoOpen(false)}
						popoverStyle={{ backgroundColor: '#eeeeee' }}
						backgroundStyle={{ backgroundColor: 'transparent' }}
						from={
							<Pressable onPress={handleDataOwnerInfo} className="p-2">
								<HugeiconsIcon
									icon={InformationCircleIcon}
									size={16}
									color="#111111"
									strokeWidth={2}
									accessibilityLabel={`Botón de información sobre la propiedad de los datos`}
									testID={`InfoDataOwnerButton`}
								/>
							</Pressable>
						}
					>
						<View className="flex-1 p-4">
							<Text>Origen de los datos: Ayuntamiento de Madrid</Text>
						</View>
					</Popover>
				</View>
				{markerState.markerType !== MarkerType.BIN && (
					<Pressable onPress={handleClose} className="p-2">
						<Text className="text-center font-lato-semibold text-base text-secondary">
							Cancelar
						</Text>
					</Pressable>
				)}
			</View>
		</View>
	)
})

export default MapBottomSheetTitle
