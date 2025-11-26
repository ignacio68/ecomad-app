import BottomSheet, {
	BottomSheetScrollView,
	BottomSheetView,
} from '@gorhom/bottom-sheet'
import { BOTTOM_SHEET_SNAP_POINTS } from '@map/constants/map'
import { getTotalCount as getTotalCountFromService } from '@/db/bins/service'
import { useBinsCountStore } from '@map/stores/binsCountStore'
import { useMapBottomSheetStore } from '@map/stores/mapBottomSheetStore'
import { useMapChipsMenuStore } from '@map/stores/mapChipsMenuStore'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View } from 'react-native'
import BinInfo from './BinInfo'

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
	const [sheetIndex, setSheetIndex] = useState(-1)
	const { mapBottomSheetTitle, markerState } = useMapBottomSheetStore()
	const { selectedChip, selectedEndPoint, clearChip } = useMapChipsMenuStore()
	const { getTotalCount, setTotalCount } = useBinsCountStore()
	const [totalBinsFromDB, setTotalBinsFromDB] = useState<number | null>(null)
	const desiredSheetIndex = useMemo(() => {
		if (!selectedChip) return -1
		return markerState.markerType === MarkerType.BIN ? 2 : 1
	}, [selectedChip, markerState.markerType])

	const isAnyChipSelected = selectedChip !== ''
	const totalBinsFromStore = selectedEndPoint
		? getTotalCount(selectedEndPoint)
		: null
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
		if (!bottomSheetRef.current) {
			setSheetIndex(desiredSheetIndex)
			return
		}

		if (desiredSheetIndex === -1) {
			setSheetIndex(-1)
			bottomSheetRef.current.close()
			return
		}

		setSheetIndex(desiredSheetIndex)
		bottomSheetRef.current.snapToIndex(desiredSheetIndex)
	}, [desiredSheetIndex])

	const handleSheetChange = useCallback(
		(index: number) => {
			if (!isAnyChipSelected) {
				setSheetIndex(index)
				return
			}

			const minIndex = markerState.markerType === MarkerType.BIN ? 2 : 1

			if (index < minIndex) {
				bottomSheetRef.current?.snapToIndex(minIndex)
				return
			}

			setSheetIndex(index)
		},
		[isAnyChipSelected, markerState.markerType],
	)

	return (
		<BottomSheet
			ref={bottomSheetRef}
			index={sheetIndex}
			enablePanDownToClose={false}
			enableDynamicSizing={true}
			snapPoints={snapPoints}
			enableOverDrag={false}
			keyboardBehavior="extend"
			onChange={handleSheetChange}
		>
			<BottomSheetView>
				<View className="mx-4 mb-8 flex-1 items-center justify-center">
					<MapBottomSheetTitle
						title={`Contenedores de ${mapBottomSheetTitle}`}
					/>
					<BottomSheetScrollView className="w-full px-2 py-2">
						{markerState.markerType === MarkerType.BIN ? (
							<BinInfo bin={markerState.selectedBin!} onClose={clearChip} />
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
