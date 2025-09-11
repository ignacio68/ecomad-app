import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { View } from 'react-native'
import {useMapBottomSheetStore} from '../../stores/mapBottomSheetStore'
import MapBottomSheetTitle from './MapBottomSheetTitle'

interface MapBottomSheetProps {
	isOpen: boolean
}

const MapBottomSheet = ({ isOpen }: MapBottomSheetProps) => {
	const snapPoints = useMemo(() => ['25%', '80%'], [])
	const bottomSheetRef = useRef<BottomSheet>(null)
	const { setIsMapBottomSheetOpen, mapBottomSheetTitle } = useMapBottomSheetStore()

	useEffect(() => {
		if (isOpen) {
			bottomSheetRef.current?.snapToIndex(1)
		} else {
			bottomSheetRef.current?.close()
		}
	}, [isOpen])

	const handleClose = useCallback(() => {
		bottomSheetRef.current?.close()
		setIsMapBottomSheetOpen(false)
	}, [setIsMapBottomSheetOpen])

	return (
		<BottomSheet
			ref={bottomSheetRef}
			index={isOpen ? 1 : -1}
			onClose={handleClose}
			enablePanDownToClose
			snapPoints={snapPoints}
			enableOverDrag={false}
		>
			<BottomSheetView>
				<View className="flex-1 items-center justify-center ">
					<MapBottomSheetTitle title={mapBottomSheetTitle} />
				</View>
			</BottomSheetView>
		</BottomSheet>
	)
}

export default MapBottomSheet
