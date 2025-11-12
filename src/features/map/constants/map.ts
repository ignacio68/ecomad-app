import type { CameraProps, MapViewProps } from '@map/types/mapConfig'
import type { LngLat, LngLatBounds } from '@map/types/mapData'
import { StyleURL } from '@rnmapbox/maps'
import { Platform } from 'react-native'

export const MAPBOX_DOWNLOADS_TOKEN = process.env
	.EXPO_PUBLIC_MAPBOX_DOWNLOADS_TOKEN as string

export const MAPBOX_PUBLIC_TOKEN = process.env
	.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN as string

export const MAPBOX_DIRECTIONS_URL = process.env
	.EXPO_PUBLIC_MAPBOX_DIRECTIONS_URL as string

export const MAPBOX_GEOCODING_URL = process.env
	.EXPO_PUBLIC_MAPBOX_GEOCODING_URL as string

export const LANGUAGE = 'es'

export const COUNTRY = 'es'

export const PLACE = 'Madrid'

export const INITIAL_CENTER: LngLat = [-3.7038, 40.4168]
export const INITIAL_BOUNDS: LngLatBounds = [
	[-3.8, 40.35], // sw (southwest)
	[-3.6, 40.5], // ne (northeast)
]

export const DEFAULT_CAMERA: CameraProps = {
	centerCoordinate: INITIAL_CENTER,
	zoomLevel: 11,
	animationDuration: 1000,
	animationMode: 'flyTo',
}

export const DEFAULT_MAP_VIEW_PROPS: MapViewProps = {
	styleURL: StyleURL.Outdoors,
}

export const COMPASS_POSITION =
	Platform.OS === 'ios' ? { top: 80, right: 18 } : { top: 120, right: 16 }

export const BOTTOM_SHEET_SNAP_POINTS = ['35%', '60%', '90%']

export const IDLE_THROTTLE_MS = 300

export const ANIMATION_PAUSE_BUFFER_MS = 150

// Thresholds para comparaciones de viewport (optimizados para performance)
export const CENTER_THRESHOLD = 0.001 // ~100 metros de diferencia - evita recálculos innecesarios
export const ZOOM_THRESHOLD = 1 // 1 nivel de zoom de diferencia - mejora la reactividad del zoom

export interface MapFABStyle {
	name: string
	styleURL: StyleURL
	image: number // require() devuelve un número (asset ID)
}
export const MAP_FAB_STYLES: MapFABStyle[] = [
	{
		name: 'Dark',
		styleURL: StyleURL.Dark,
		image: require('@map/assets/images/map-styles/dark.png'),
	},
	{
		name: 'Light',
		styleURL: StyleURL.Light,
		image: require('@map/assets/images/map-styles/light.png'),
	},
	{
		name: 'Satellite',
		styleURL: StyleURL.SatelliteStreet,
		image: require('@map/assets/images/map-styles/satellite_street.png'),
	},
	{
		name: 'Outdoors',
		styleURL: StyleURL.Outdoors,
		image: require('@map/assets/images/map-styles/outdoors.png'),
	},
]

// Constantes para paddings de navegación (fitBounds)
export const NAVIGATION_PADDING_TOP = 140 // Padding superior para dejar espacio al chips container
export const NAVIGATION_PADDING_BOTTOM = 360 // TODO: hacerlo programáticamente con la altura del bottom sheet
// Padding inferior para bottom sheet (~25% snap point en pantallas típicas)
export const NAVIGATION_PADDING_LEFT = 60 // Padding lateral izquierdo
export const NAVIGATION_PADDING_RIGHT = 60 // Padding lateral derecho

export const ANIMATION_DURATION_MS = 800 // Duración de animaciones del mapa
export const ANIMATION_TIMEOUT_MS = 820 // Timeout para animaciones
