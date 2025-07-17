import { CameraProps, MapViewProps } from '../types'
import { StyleURL } from '@rnmapbox/maps'
import Constants from 'expo-constants'

export const MAPBOX_SECRET_TOKEN = Constants.expoConfig?.extra
	?.MAPBOX_SECRET_TOKEN as string

export const DEFAULT_CAMERA: CameraProps = {
	centerCoordinate: [-3.7038, 40.4168], // Madrid, Madrid, Spain
	zoomLevel: 12,
}

export const DEFAULT_MAP_VIEW_PROPS: MapViewProps = {
  styleURL: StyleURL.Light,
}

