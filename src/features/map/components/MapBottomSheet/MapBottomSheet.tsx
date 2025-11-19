import BottomSheet, {
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

		const loadTotalCountFromDB = async () => {
			try {
				console.log(`🔍 [BOTTOMSHEET] Loading total count from DB for ${selectedEndPoint}`)
				const count = await getTotalCountFromService(selectedEndPoint)
				console.log(`🔍 [BOTTOMSHEET] Total count from DB for ${selectedEndPoint}:`, count)
				if (count !== null) {
					setTotalBinsFromDB(count)
					// Actualizar el store también para futuras consultas
					setTotalCount(selectedEndPoint, count)
					console.log(`✅ [BOTTOMSHEET] Updated total count in store for ${selectedEndPoint}:`, count)
				} else {
					console.log(`⚠️ [BOTTOMSHEET] No total count found in DB for ${selectedEndPoint}`)
					setTotalBinsFromDB(null)
				}
			} catch (error) {
				console.error(`❌ Error loading total count for ${selectedEndPoint}:`, error)
				setTotalBinsFromDB(null)
			}
		}

		// Solo cargar desde DB si no está en el store
		if (!totalBinsFromStore) {
			loadTotalCountFromDB()
		} else {
			setTotalBinsFromDB(null)
		}
	}, [selectedEndPoint, totalBinsFromStore, setTotalCount])

	useEffect(() => {
		if (isAnyChipSelected) {
			bottomSheetRef.current?.snapToIndex(1)
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

	const renderContent = () => {
		if (markerState.markerType === MarkerType.BIN) {
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
			containerStyle={styles.bottomSheetContainerStyle}
		>
			<BottomSheetView>
				<View className="mx-4 mb-8 flex-1 items-center justify-center">
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
