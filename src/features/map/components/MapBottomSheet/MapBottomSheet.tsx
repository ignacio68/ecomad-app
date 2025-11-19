import BottomSheet, {
	BottomSheetScrollView,
	BottomSheetView,
	SCREEN_WIDTH,
} from '@gorhom/bottom-sheet'
import { BOTTOM_SHEET_SNAP_POINTS } from '@map/constants/map'
import { getTotalCount as getTotalCountFromService } from '@/db/bins/service'
import { useBinsCountStore } from '@map/stores/binsCountStore'
import { useMapBottomSheetStore } from '@map/stores/mapBottomSheetStore'
import { useMapChipsMenuStore } from '@map/stores/mapChipsMenuStore'
import { useEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import BinInfo from './BinInfo'
// import ClusterInfo from './ClusterInfo'
import { MarkerType } from '@map/types/mapData'
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
	const { getTotalCount, setTotalCount } = useBinsCountStore()
	const [totalBinsFromDB, setTotalBinsFromDB] = useState<number | null>(null)

	const isAnyChipSelected = selectedChip !== ''
	const totalBinsFromStore = selectedEndPoint ? getTotalCount(selectedEndPoint) : null
	const totalBins = totalBinsFromStore ?? totalBinsFromDB

	// Cargar total count desde SQLite si no está en el store
useEffect(() => {
	if (!selectedEndPoint) {
		setTotalBinsFromDB(null)
		return
	}

	if (totalBinsFromStore != null) {
		setTotalBinsFromDB(totalBinsFromStore)
		return
	}

	const load = async () => {
		try {
			const count = await getTotalCountFromService(selectedEndPoint)
			setTotalBinsFromDB(count)
			if (count != null) setTotalCount(selectedEndPoint, count)
		} catch (error) {
			console.error(
				`❌ Error loading total count for ${selectedEndPoint}:`,
				error,
			)
			setTotalBinsFromDB(null)
		}
	}

	load()
}, [selectedEndPoint, totalBinsFromStore, setTotalCount])


	useEffect(() => {
		if (isAnyChipSelected) {
			markerState.markerType === MarkerType.BIN ? bottomSheetRef.current?.snapToIndex(2) : bottomSheetRef.current?.snapToIndex(1)
		} else {
			bottomSheetRef.current?.close()
		}
	}, [isAnyChipSelected])

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


	return (
		<BottomSheet
			ref={bottomSheetRef}
			index={isAnyChipSelected ? 1 : -1}
			enablePanDownToClose={false}
			enableDynamicSizing={true}
			snapPoints={snapPoints}
			enableOverDrag={false}
			keyboardBehavior="extend"
			containerStyle={styles.bottomSheetContainerStyle}
		>
			<BottomSheetView>
				<View className="mx-4 mb-8 flex-1 items-center justify-center">
					<MapBottomSheetTitle
						title={`Contenedores de ${mapBottomSheetTitle}`}
					/>
					<BottomSheetScrollView className="w-full px-2 py-2">
					{markerState.markerType === MarkerType.BIN ? (
						<BinInfo bin={markerState.selectedBin!} />
					) : (
						<GeneralInfo
							mapBottomSheetTitle={mapBottomSheetTitle}
							totalBins={totalBins}
						/>
					)}
					</BottomSheetScrollView>
				</View>
			</BottomSheetView>
		</BottomSheet>
	)
}

export default MapBottomSheet
