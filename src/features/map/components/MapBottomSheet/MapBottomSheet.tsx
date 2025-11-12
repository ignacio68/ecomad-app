import BottomSheet, {
	BottomSheetView,
	SCREEN_WIDTH,
} from '@gorhom/bottom-sheet'
import { BOTTOM_SHEET_SNAP_POINTS } from '@map/constants/map'
import { useBinsCountStore } from '@map/stores/binsCountStore'
import { useMapBottomSheetStore } from '@map/stores/mapBottomSheetStore'
import { useMapChipsMenuStore } from '@map/stores/mapChipsMenuStore'
import { MarkerType } from '@map/types/mapData'
import { useEffect, useMemo, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import BinInfo from './BinInfo'
// import ClusterInfo from './ClusterInfo'
import GeneralInfo from './GeneralInfo'
import MapBottomSheetTitle from './MapBottomSheetTitle'
// import NearbyButton from './NearbyButton'
// import MapAutocomplete from './MapAutocomplete/MapAutocomplete'

interface MapBottomSheetProps {
	isOpen: boolean
}

const MapBottomSheet = ({ isOpen, ...props }: MapBottomSheetProps) => {
	const snapPoints = useMemo(() => BOTTOM_SHEET_SNAP_POINTS, [])
	const bottomSheetRef = useRef<BottomSheet>(null)
	const { mapBottomSheetTitle, markerState } = useMapBottomSheetStore()
	const { selectedChip, selectedEndPoint } = useMapChipsMenuStore()
	const { getTotalCount } = useBinsCountStore()

	const isAnyChipSelected = selectedChip !== ''
	const totalBins = selectedEndPoint ? getTotalCount(selectedEndPoint) : null

	useEffect(() => {
		if (isAnyChipSelected) {
			bottomSheetRef.current?.snapToIndex(1)
		} else {
			bottomSheetRef.current?.close()
		}
	}, [isAnyChipSelected])

	// const makeStyle = () => {
	// 	let horizontalMarginBottomSheet = 0
	// 	if (SCREEN_WIDTH > 500) {
	// 		horizontalMarginBottomSheet = (SCREEN_WIDTH - 500) / 2
	// 	}

	// 	return StyleSheet.create({
	// 		bottomSheetContainerStyle: {
	// 			marginHorizontal: horizontalMarginBottomSheet,
	// 		},
	// 	})
	// }

	// const styles = makeStyle()



	const renderContent = () => {
		if( markerState.markerType === MarkerType.BIN) {
			return markerState.selectedBin ? (
				<BinInfo bin={markerState.selectedBin} />
			) : (
				<GeneralInfo
					mapBottomSheetTitle={mapBottomSheetTitle}
					totalBins={totalBins}
				/>
			)
		}

		return (
			<GeneralInfo
				mapBottomSheetTitle={mapBottomSheetTitle}
				totalBins={totalBins}
			/>
		)

	}

	return (
		<BottomSheet
			ref={bottomSheetRef}
			index={isAnyChipSelected ? 1 : -1}
			enablePanDownToClose={false}
			enableDynamicSizing={true}
			snapPoints={snapPoints}
			enableOverDrag={false}
			keyboardBehavior="extend"
			// containerStyle={styles.bottomSheetContainerStyle}
		>
			<BottomSheetView>
				<View className="mx-4 mb-8 flex-1 items-center justify-center">
					<MapBottomSheetTitle
						title={`Contenedores de ${mapBottomSheetTitle}`}
					/>
					{/* {markerState.markerType === MarkerType.GENERAL ||
					markerState.markerType === MarkerType.CLUSTER ? (
						<MapAutocomplete />
					) : null} */}
					{/* <NearbyButton /> */}
					{renderContent()}
				</View>
			</BottomSheetView>
		</BottomSheet>
	)
}

export default MapBottomSheet
