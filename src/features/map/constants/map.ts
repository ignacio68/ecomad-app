import { StyleURL } from '@rnmapbox/maps'
import Constants from 'expo-constants'
import { CameraProps, MapViewProps } from '../types/mapConfig'
import { LngLat, LngLatBounds } from '../types/mapData'

export const MAPBOX_DOWNLOADS_TOKEN = Constants.expoConfig?.extra
	?.MAPBOX_DOWNLOADS_TOKEN as string

export const INITIAL_CENTER: LngLat = [-3.7038, 40.4168]

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
