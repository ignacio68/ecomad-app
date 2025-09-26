export interface MapViewProps {
	styleURL: string
}

export interface CameraProps {
	centerCoordinate: [number, number]
  zoomLevel: number
  animationDuration: number
  animationMode: 'flyTo' | 'easeTo' | 'none'
}