
import Mapbox from '@rnmapbox/maps'
import { MAPBOX_DOWNLOADS_TOKEN } from '../constants/map'

export const setMapboxAccessToken = () => {
	try {
		if (!MAPBOX_DOWNLOADS_TOKEN) {
			console.warn('Mapbox token no encontrado')
			return
		}
		Mapbox.setAccessToken(MAPBOX_DOWNLOADS_TOKEN)
	} catch (error) {
		console.error('Error al configurar Mapbox token:', error)
	}
}

