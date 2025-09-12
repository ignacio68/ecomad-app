import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import CustomButton from '@/shared/components/ui/buttons/CustomButton'
import { View } from 'react-native'
import { useMapDataByZoom } from '../../hooks/useMapDataByZoom'
import { useMapBottomSheetStore } from '../../stores/mapBottomSheetStore'
import { useMapDataStore } from '../../stores/mapDataStore'
import MapBottomSheetTitle from './MapBottomSheetTitle'

interface MapBottomSheetProps {
	isOpen: boolean
}

const MapBottomSheet = ({ isOpen }: MapBottomSheetProps) => {
	const snapPoints = useMemo(() => ['25%', '80%'], [])
	const bottomSheetRef = useRef<BottomSheet>(null)
	const { setIsMapBottomSheetOpen, mapBottomSheetTitle } =
		useMapBottomSheetStore()
	const { setMapData, clearMapData } = useMapDataStore()
	const [isAllBinsSelected, setIsAllBinsSelected] = useState(false)

	// Hook para obtener datos según zoom y bounds
	const { mapData, refetch } = useMapDataByZoom(isAllBinsSelected) // Solo buscar datos cuando el botón esté activo

	useEffect(() => {
		if (isOpen) {
			bottomSheetRef.current?.snapToIndex(1)
		} else {
			bottomSheetRef.current?.close()
		}
	}, [isOpen])

	// Sincronizar datos con el store
	useEffect(() => {
		if (isAllBinsSelected) {
			setMapData(mapData)
		} else {
			clearMapData()
		}
	}, [mapData, isAllBinsSelected, setMapData, clearMapData])

	const handleClose = useCallback(() => {
		bottomSheetRef.current?.close()
		setIsMapBottomSheetOpen(false)
	}, [setIsMapBottomSheetOpen])

	const getAllBins = useCallback(() => {
		setIsAllBinsSelected(prev => {
			const newValue = !prev
			console.log('🔘 getAllBins clicked:', newValue)
			if (newValue) {
				console.log('=== DEBUGGING MAP DATA (SIMPLIFIED) ===')
				console.log('Map Data:', mapData)
				console.log('Loading:', mapData.loading)
				console.log('Error:', mapData.error)
				console.log('Data count:', mapData.data?.length || 0)
				console.log('=====================================')

				// Forzar refetch de datos
				refetch()
			} else {
				console.log('🚫 Botón desactivado - limpiando datos')
			}
			return newValue
		})
	}, [mapData, refetch])

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
					<View className="flex-1 items-center justify-center">
						<CustomButton
							title="Todos los contenedores"
							mode="primary"
							size="medium"
							onPress={getAllBins}
							isSelected={isAllBinsSelected}
						/>
					</View>
				</View>
			</BottomSheetView>
		</BottomSheet>
	)
}

export default MapBottomSheet
