import Mapbox from '@rnmapbox/maps'
import { MAPBOX_SECRET_TOKEN } from '../constants'

export const setMapAccessToken = () => {
	Mapbox.setAccessToken(MAPBOX_SECRET_TOKEN)
}

export const MapboxAdapter = {
	MapView: Mapbox.MapView,
	Camera: Mapbox.Camera,
	Marker: Mapbox.PointAnnotation,
	// Puedes añadir más métodos/componentes según tus necesidades
}
