import {
	Cancel01Icon,
	InformationCircleIcon,
} from '@hugeicons-pro/core-stroke-rounded'
import { HugeiconsIcon } from '@hugeicons/react-native'
import React, { useCallback, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import Popover from 'react-native-popover-view'
import { useMapBottomSheetStore } from '../../stores/mapBottomSheetStore'
import { useMapChipsMenuStore } from '../../stores/mapChipsMenuStore'
import { useMapViewportStore } from '../../stores/mapViewportStore'
import { MapZoomLevels } from '../../types/mapData'

const MapBottomSheetTitle = React.memo(({ title }: { title: string }) => {
	const { setIsMapBottomSheetOpen, markerState, reset, setMarkerType } =
		useMapBottomSheetStore()
	const { setViewportAnimated, viewport } = useMapViewportStore()
	const { selectedChip, clearChip } = useMapChipsMenuStore()
	const [isDataOwnerInfoOpen, setIsDataOwnerInfoOpen] = useState(false)

	const handleClose = useCallback(() => {
		if (markerState.markerType === 'general') {
			setIsMapBottomSheetOpen(false)
			clearChip()
		} else {
			if (viewport.center) {
				setViewportAnimated({
					center: viewport.center,
					zoom: MapZoomLevels.CLUSTER,
				})
			}
			setMarkerType('general')
			reset()
		}
	}, [
		clearChip,
		markerState.markerType,
		reset,
		setIsMapBottomSheetOpen,
		setMarkerType,
		setViewportAnimated,
		viewport.center,
	])

	const handleDataOwnerInfo = () => {
		setIsDataOwnerInfoOpen(true)
	}

	return (
		<View className="w-full flex-1 flex-row items-center justify-between px-8 py-4">
			<View className="flex-1 flex-row items-center">
				<Text className="font-lato-semibold text-2xl text-black">{title}</Text>
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
			<Pressable onPress={handleClose} className="rounded-full bg-gray-100 p-2">
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
	)
})

export default MapBottomSheetTitle
