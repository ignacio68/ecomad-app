import { MapboxAdapter} from '../adapters/MapboxAdapter';
import { ComponentProps } from 'react';

export { setMapAccessToken } from '../adapters/MapboxAdapter'

export function MapView(props: ComponentProps<typeof MapboxAdapter.MapView>) {
  return <MapboxAdapter.MapView {...props}/>;
}

export function Camera(props: ComponentProps<typeof MapboxAdapter.Camera>) {
  return <MapboxAdapter.Camera {...props} />;
}

export function Marker(props: ComponentProps<typeof MapboxAdapter.Marker>) {
  return <MapboxAdapter.Marker {...props} />;
}

// Puedes añadir más funciones según necesidades