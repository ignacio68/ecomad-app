import { DEFAULT_CAMERA, DEFAULT_MAP_VIEW_PROPS } from '../constants/map'
import { Camera, MapView, setMapAccessToken } from '../services/mapService'
import { mapStyles } from '../styles/mapStyles'

setMapAccessToken()

const MapBase = () => {
	const { centerCoordinate, zoomLevel } = DEFAULT_CAMERA
	const { styleURL } = DEFAULT_MAP_VIEW_PROPS

	return (
		<MapView style={mapStyles.map} styleURL={styleURL} scaleBarEnabled={false}>
			<Camera zoomLevel={zoomLevel} centerCoordinate={centerCoordinate} />
		</MapView>
	)
}

export default MapBase
