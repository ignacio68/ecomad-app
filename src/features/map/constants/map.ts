import { StyleURL } from '@rnmapbox/maps'
import Constants from 'expo-constants'
import { CameraProps, MapViewProps } from '../domain'

export const MAPBOX_DOWNLOADS_TOKEN = Constants.expoConfig?.extra
	?.MAPBOX_DOWNLOADS_TOKEN as string

export const DEFAULT_CAMERA: CameraProps = {
	centerCoordinate: [-3.7038, 40.4168], // Madrid, Madrid, Spain
	zoomLevel: 12,
	animationDuration: 1000,
	animationMode: 'flyTo',
}

export const DEFAULT_MAP_VIEW_PROPS: MapViewProps = {
	styleURL: StyleURL.Light,
}
