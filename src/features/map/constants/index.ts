// import type { MapViewProps } from '@/types/map'
// import { MapType, Style } from '@nativescript/google-maps'

// export const DEFAULT_MAP_VIEW_PROPS: MapViewProps = {
// 	lat: 40.4165,
// 	lng: -3.70256,
// 	zoom: 12,
// 	bearing: 0,
// 	tilt: 0,
// 	mapType: MapType.Normal,
// 	style: undefined,
// 	preventDefaultMarkerTapBehavior: false,
// 	showUserLocation: false,
// }

// // Ejemplo de estilo personalizado: modo noche
// export const NIGHT_MAP_STYLE: Style[] = [
// 	{
// 		featureType: 'all',
// 		elementType: 'geometry',
// 		stylers: [{ color: '#242f3e' }],
// 	},
// 	{
// 		featureType: 'road',
// 		elementType: 'geometry',
// 		stylers: [{ color: '#38414e' }],
// 	},
// 	{
// 		featureType: 'water',
// 		elementType: 'geometry',
// 		stylers: [{ color: '#17263c' }],
// 	},
// 	{
// 		featureType: 'poi',
// 		elementType: 'labels.text.fill',
// 		stylers: [{ color: '#746855' }],
// 	},
// ]

// export interface MapStyleOption {
// 	mapType: MapType
// 	style?: Style[]
// }

// export const MAP_STYLES: MapStyleOption[] = [
// 	{ mapType: MapType.Normal, style: undefined },
// 	{ mapType: MapType.Satellite, style: undefined },
// 	{ mapType: MapType.Terrain, style: undefined },
// 	{ mapType: MapType.Hybrid, style: undefined },
// 	{ mapType: MapType.Normal, style: NIGHT_MAP_STYLE }, // modo noche
// ]
