import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import CustomButton from '@/shared/components/ui/buttons/CustomButton'
import { Text, View } from 'react-native'
import { useBinsCountStore } from '../../stores/binsCountStore'
import { useMapBottomSheetStore } from '../../stores/mapBottomSheetStore'
import { useMapChipsMenuStore } from '../../stores/mapChipsMenuStore'
import { useMapDataStore } from '../../stores/mapDataStore'
import { useMapViewportStore } from '../../stores/mapViewportStore'
import MapBottomSheetTitle from './MapBottomSheetTitle'

interface MapBottomSheetProps {
	isOpen: boolean
}

const MapBottomSheet = ({ isOpen }: MapBottomSheetProps) => {
	const snapPoints = useMemo(() => ['25%', '80%'], [])
	const bottomSheetRef = useRef<BottomSheet>(null)
	const { mapBottomSheetTitle } = useMapBottomSheetStore()
	const { clearMapData } = useMapDataStore()
	const { selectedChip, selectedEndPoint } = useMapChipsMenuStore()
	const { viewport } = useMapViewportStore()
	const { getTotalCount } = useBinsCountStore()

	// Determinar si hay un chip seleccionado (cualquier tipo)
	const isAnyChipSelected = selectedChip !== ''

	// Obtener datos del store (ya manejados por useMapDataByZoom)
	const { mapData } = useMapDataStore()

	// Obtener el conteo total del tipo de contenedor seleccionado
	const totalBins = selectedEndPoint ? getTotalCount(selectedEndPoint) : null

	// Controlar apertura/cierre del BottomSheet y limpiar datos
	useEffect(() => {
		if (isAnyChipSelected) {
			bottomSheetRef.current?.snapToIndex(1)
		} else {
			bottomSheetRef.current?.close()
			clearMapData()
		}
	}, [isAnyChipSelected, clearMapData])

	// Función de cerrar comentada temporalmente
	// const handleClose = useCallback(() => {
	// 	bottomSheetRef.current?.close()
	// 	setIsMapBottomSheetOpen(false)
	// }, [setIsMapBottomSheetOpen])

	const handleInfoButton = useCallback(() => {
		console.log('ℹ️ Información de contenedores')
		console.log('=== DEBUGGING MAP DATA ===')
		console.log('Map Data Type:', mapData.type)
		console.log('Zoom Level:', viewport.zoom)
		console.log('Map Data:', mapData)
		console.log('Loading:', mapData.loading)
		console.log('Error:', mapData.error)
		console.log('Data count:', mapData.data?.length || 0)
		console.log('Selected EndPoint:', selectedEndPoint)
		console.log('Total Bins:', totalBins)
		console.log('Map Bottom Sheet Title:', mapBottomSheetTitle)
		console.log('=========================')
	}, [mapData, viewport.zoom, selectedEndPoint, totalBins, mapBottomSheetTitle])

	const getTotalCountText = (totalBins: number | null) => {
		return totalBins == null || totalBins > 0 ? `En Madrid hay ${totalBins?.toLocaleString()} contenedores de ${mapBottomSheetTitle}` : `Madrid no dispone de contenedores de ${mapBottomSheetTitle}`
	}

	return (
		<BottomSheet
			ref={bottomSheetRef}
			index={isAnyChipSelected ? 1 : -1} // Basado en chip seleccionado, no en isOpen
			// onClose={handleClose} // Comentado temporalmente
			enablePanDownToClose={false} // Deshabilitado temporalmente
			snapPoints={snapPoints}
			enableOverDrag={false}
		>
			<BottomSheetView>
				<View className="flex-1 items-center justify-center ">
					<MapBottomSheetTitle
						title={`Contenedores de ${mapBottomSheetTitle}`}
					/>
					<View className="flex-1 items-center justify-center">
						<Text className="text-center text-lg font-regular">
							{getTotalCountText(totalBins )}
						</Text>
						{/* <CustomButton
							title={mapBottomSheetTitle || 'Contenedores'}
							mode="primary"
							size="medium"
							onPress={handleInfoButton}
							isSelected={isAnyChipSelected}
						/> */}
					</View>
				</View>
			</BottomSheetView>
		</BottomSheet>
	)
}

export default MapBottomSheet
