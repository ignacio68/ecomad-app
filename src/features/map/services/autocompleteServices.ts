import { fetch } from 'expo/fetch'
import {
	MAPBOX_PUBLIC_TOKEN,
	MAPBOX_DOWNLOADS_TOKEN,
	MAPBOX_GEOCODING_URL,
	INITIAL_CENTER,
	COUNTRY,
	LANGUAGE,
	PLACE,
} from '@map/constants/map'

export const getAutocompletedirections = async (direction: string) => {
	try {
		const params = `forward?q=${direction}&proximity=${INITIAL_CENTER[0]},${INITIAL_CENTER[1]}&language=${LANGUAGE}&access_token=${MAPBOX_PUBLIC_TOKEN}`
		const url = `${MAPBOX_GEOCODING_URL}${params}`

		const response = await fetch(url)

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		console.log('🔍 Mapbox Geocoding API response:', response.status)
		const results = await response.json()
		const features = results?.features

		console.log('🔍 Mapbox Geocoding API response:', features)
	} catch (error) {
		console.error('❌ Error getting autocomplete directions:', error)
		return null
	}
}
