import {
	Cancel01Icon,
	InformationCircleIcon,
} from '@hugeicons-pro/core-stroke-rounded'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { useMapBottomSheetStore } from '@map/stores/mapBottomSheetStore'
import { useMapChipsMenuStore } from '@map/stores/mapChipsMenuStore'
import { useMapNavigationStore } from '@map/stores/mapNavigationStore'
import { MarkerType } from '@map/types/mapData'
import React, { memo, useCallback, useState } from 'react'
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
		<View className="w-full px-8">
			{/* <View className="flex-">
				<Image
					source={require('../../assets/images/clothes_bin_small_02.png')}
					className="w-full bg-green-500"
					resizeMode="contain"
					accessibilityLabel={'`foto de un contenedor`'}
					testID={'contenedor_foto'}
				/>
			</View> */}
			<View className="flex-row items-center justify-between py-4">
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
				<Pressable
					onPress={handleClose}
					className="rounded-full bg-gray-100 p-2"
				>
					<HugeiconsIcon
						icon={Cancel01Icon}
						size={16}
						color="black"
						strokeWidth={2}
						accessibilidadLabel={`Cierra el bottom sheet de ${title}`}
						testID={`CloseBottomSheet`}
					/>
				</Pressable>
			</View>
		</View>
	)
})

export default MapBottomSheetTitle
