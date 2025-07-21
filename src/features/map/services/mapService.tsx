import { MapboxAdapter} from '../adapters/MapboxAdapter';
import { MapViewProps, CameraProps, MarkerProps } from '../types';

export { MapboxAdapter as MapAdapter } from '../adapters/MapboxAdapter'
export { setMapboxAccessToken as setMapAccessToken } from '../adapters/MapboxAdapter'


export function MapView(props: MapViewProps) {
  return <MapboxAdapter.MapView {...props}/>;
}

export function Camera(props: CameraProps) {
  return <MapboxAdapter.Camera {...props} />;
}

export function Marker(props: MarkerProps) {
  return <MapboxAdapter.Marker {...props} />;
}

// Puedes añadir más funciones según necesidades