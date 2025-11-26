import BottomSheet, {
	BottomSheetScrollView,
	BottomSheetView,
	SCREEN_WIDTH,
} from '@gorhom/bottom-sheet'
import { View, Text, StyleSheet } from 'react-native'

import { useMapBottomSheetStore } from '@map/stores/mapBottomSheetStore'
import { useMemo, useRef } from 'react'

interface NavigationBottomSheetProps {
	isOpen: boolean
}
const NavigationBottomSheet = ({
	isOpen,
	...props
}: NavigationBottomSheetProps) => {
	const { setIsMapBottomSheetOpen } = useMapBottomSheetStore()

	const snapPoints = useMemo(() => ['50%', '90%'], [])

	const makeStyle = () => {
		let horizontalMarginBottomSheet = 0
		if (SCREEN_WIDTH > 500) {
			horizontalMarginBottomSheet = (SCREEN_WIDTH - 500) / 2
		}

		return StyleSheet.create({
			bottomSheetContainerStyle: {
				marginHorizontal: horizontalMarginBottomSheet,
			},
		})
	}

	const styles = makeStyle()

	const bottomSheetRef = useRef<BottomSheet>(null)
	return (
		<BottomSheet
			ref={bottomSheetRef}
			index={isOpen ? 1 : -1}
			enablePanDownToClose={false}
			enableDynamicSizing={true}
			snapPoints={snapPoints}
			enableOverDrag={false}
			keyboardBehavior="extend"
			containerStyle={styles.bottomSheetContainerStyle}
		>
			<View>
				<Text className="font-lato-bold text-2xl">Navegación</Text>
			</View>
			<BottomSheetScrollView>
				<Text className="font-lato-bold text-2xl">Navigation Bottom Sheet</Text>
			</BottomSheetScrollView>
		</BottomSheet>
	)
}

export default NavigationBottomSheet
