import ChipsContainer from '@/components/ui/ChipsContainer'
import { useState } from 'react'
import { View } from 'react-native'
import MapBase from './components/MapBase'
import { DEFAULT_CAMERA, DEFAULT_MAP_VIEW_PROPS } from './constants/map'
import { setMapAccessToken } from './services/mapService'
import { CHIPS_LIST } from './constants/chips'

setMapAccessToken()

const MapContainer = () => {
	const { centerCoordinate, zoomLevel } = DEFAULT_CAMERA
	const { styleURL } = DEFAULT_MAP_VIEW_PROPS

	// Estado para manejar chips seleccionados
	const [selectedChips, setSelectedChips] = useState<string[]>([])


	return (
		<View className="flex-1">
			<MapBase />
			<ChipsContainer
				chips={CHIPS_LIST}
				containerClassName="absolute left-0 right-0 top-16"
				scrollViewClassName="px-4 py-2"
			/>
		</View>
	)
}

export default MapContainer
