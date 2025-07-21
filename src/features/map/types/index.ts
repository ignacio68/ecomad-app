import { MapAdapter } from '../services/mapService'
import { ComponentProps } from 'react'

export interface MapViewProps
	extends ComponentProps<typeof MapAdapter.MapView> {}
export interface CameraProps
	extends ComponentProps<typeof MapAdapter.Camera> {}
export interface MarkerProps
	extends ComponentProps<typeof MapAdapter.Marker> {}