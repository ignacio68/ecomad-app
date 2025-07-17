import { View } from 'react-native'
import { DEFAULT_CAMERA, DEFAULT_MAP_VIEW_PROPS } from './constants'
import { Camera, MapView, setMapAccessToken } from './services/mapService'
import { mapStyles } from './styles/mapStyles'

setMapAccessToken()

const MapContainer = () => {
	const { centerCoordinate, zoomLevel } = DEFAULT_CAMERA
	const { styleURL } = DEFAULT_MAP_VIEW_PROPS

	return (
		<View className="h-full w-full flex-1">
			<MapView style={mapStyles.map} styleURL={styleURL}>
				<Camera zoomLevel={zoomLevel} centerCoordinate={centerCoordinate} />
			</MapView>
		</View>
	)
}

export default MapContainer
