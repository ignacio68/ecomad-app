import { StyleURL } from '@rnmapbox/maps'
import { CameraProps, MapViewProps } from '../types/mapConfig'
import { LngLat, LngLatBounds } from '../types/mapData'

export const MAPBOX_DOWNLOADS_TOKEN = process.env
	.EXPO_PUBLIC_MAPBOX_DOWNLOADS_TOKEN as string

export const MAPBOX_PUBLIC_TOKEN = process.env
	.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN as string

export const EXPO_PUBLIC_MAPBOX_DIRECTIONS_URL = process.env
	.EXPO_PUBLIC_MAPBOX_DIRECTIONS_URL as string

export const INITIAL_CENTER: LngLat = [-3.7038, 40.4168] //Coordenadas de Madrid por defecto

export const INITIAL_BOUNDS: LngLatBounds = [
	[-3.8, 40.35], // sw (southwest)
	[-3.6, 40.5], // ne (northeast)
]

export const DEFAULT_CAMERA: CameraProps = {
	centerCoordinate: INITIAL_CENTER,
	zoomLevel: 12,
	animationDuration: 1000,
	animationMode: 'flyTo',
}

export const DEFAULT_MAP_VIEW_PROPS: MapViewProps = {
	styleURL: StyleURL.Light,
}

export const COMPASS_POSITION = { top: 360, right: 14 }

export const BOTTOM_SHEET_SNAP_POINTS = ['25%', '80%']

export const BOUNDS_THROTTLE_MS = 200

// Thresholds para comparaciones de viewport (optimizados para performance)
export const CENTER_THRESHOLD = 0.0001 // ~10 metros de diferencia - evita recálculos innecesarios
export const ZOOM_THRESHOLD = 2 // 2 niveles de zoom de diferencia - reduce renders significativamente

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
		name: 'Satellite',
		styleURL: StyleURL.SatelliteStreet,
		image: require('@map/assets/images/map-styles/satellite_street.png'),
	},
	{
		name: 'Outdoors',
		styleURL: StyleURL.Outdoors,
		image: require('@map/assets/images/map-styles/outdoors.png'),
	},
	{
		name: 'Light',
		styleURL: StyleURL.Light,
		image: require('@map/assets/images/map-styles/light.png'),
	},
]

// Constantes para paddings de navegación (fitBounds)
export const NAVIGATION_PADDING_TOP = 140 // Padding superior para dejar espacio al chips container
export const NAVIGATION_PADDING_BOTTOM = 360
// Padding inferior para bottom sheet (~25% snap point en pantallas típicas)
export const NAVIGATION_PADDING_LEFT = 60 // Padding lateral izquierdo
export const NAVIGATION_PADDING_RIGHT = 60 // Padding lateral derecho
