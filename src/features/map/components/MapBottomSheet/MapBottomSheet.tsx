import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { useEffect, useMemo, useRef } from 'react'

import { View } from 'react-native'
import { useBinsCountStore } from '../../stores/binsCountStore'
import { useMapBottomSheetStore } from '../../stores/mapBottomSheetStore'
import { useMapChipsMenuStore } from '../../stores/mapChipsMenuStore'
import { useMapDataStore } from '../../stores/mapDataStore'
import { BOTTOM_SHEET_SNAP_POINTS } from '../../constants/clustering'
import BinInfo from './BinInfo'
import ClusterInfo from './ClusterInfo'
import GeneralInfo from './GeneralInfo'
import MapBottomSheetTitle from './MapBottomSheetTitle'

interface MapBottomSheetProps {
	isOpen: boolean
}

const MapBottomSheet = ({ isOpen }: MapBottomSheetProps) => {
	const snapPoints = useMemo(() => BOTTOM_SHEET_SNAP_POINTS, [])
	const bottomSheetRef = useRef<BottomSheet>(null)
	const { mapBottomSheetTitle, markerState } = useMapBottomSheetStore()
	const { clearMapData } = useMapDataStore()
	const { selectedChip, selectedEndPoint } = useMapChipsMenuStore()
	const { getTotalCount } = useBinsCountStore()

	const isAnyChipSelected = selectedChip !== ''
	const totalBins = selectedEndPoint ? getTotalCount(selectedEndPoint) : null

	useEffect(() => {
		if (isAnyChipSelected) {
			bottomSheetRef.current?.snapToIndex(1)
		} else {
			bottomSheetRef.current?.close()
			clearMapData()
		}
	}, [isAnyChipSelected, clearMapData])

	const renderContent = () => {
		switch (markerState.markerType) {
			case 'cluster':
				return markerState.selectedCluster ? (
					<ClusterInfo cluster={markerState.selectedCluster} />
				) : (
					<GeneralInfo
						mapBottomSheetTitle={mapBottomSheetTitle}
						totalBins={totalBins}
					/>
				)
			case 'bin':
				return markerState.selectedBin ? (
					<BinInfo bin={markerState.selectedBin} />
				) : (
					<GeneralInfo
						mapBottomSheetTitle={mapBottomSheetTitle}
						totalBins={totalBins}
					/>
				)
			case 'general':
			default:
				return (
					<GeneralInfo
						mapBottomSheetTitle={mapBottomSheetTitle}
						totalBins={totalBins}
					/>
				)
		}
	}

	return (
		<BottomSheet
			ref={bottomSheetRef}
			index={isAnyChipSelected ? 1 : -1}
			enablePanDownToClose={false}
			snapPoints={snapPoints}
			enableOverDrag={false}
		>
			<BottomSheetView>
				<View className="flex-1 items-center justify-center">
					<MapBottomSheetTitle
						title={`Contenedores de ${mapBottomSheetTitle}`}
					/>
					{renderContent()}
				</View>
			</BottomSheetView>
		</BottomSheet>
	)
}

export default MapBottomSheet
