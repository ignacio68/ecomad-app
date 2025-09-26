// Tipos unificados para datos del mapa (distritos y barrios)
import { BinType } from '@/shared/types/bins'

export type MapLocationType = 'districts' | 'neighborhoods' | 'containers'

export interface MapDataItem {
	id: string
	name: string
	count: number
	centroid: {
		lat: number
		lng: number
	}
	type: MapLocationType
}

export interface MapData {
	data: MapDataItem[]
	loading: boolean
	error: string | null
	type: MapLocationType
	endPoint: BinType | null
}

export interface MapDataCache {
	districts: MapDataItem[]
	neighborhoods: MapDataItem[]
	lastUpdated: {
		districts: number
		neighborhoods: number
	}
}

export enum MapZoomLevels {
	// NEUTRAL = 10,
	// DISTRICT = 12.5,
	// NEIGHBORHOOD = 15,
	// CONTAINER = 16,
	DISTRICT = 12.5,
	NEIGHBORHOOD = 14,
	CONTAINER = 15,
}
