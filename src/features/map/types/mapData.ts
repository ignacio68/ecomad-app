import type { BinType } from '@/shared/types/bins'

export interface BinPoint {
	type: 'Feature'
	properties: {
		cluster: boolean
		point_count?: number
		binType: BinType
		binId: string
		category_group_id: number
		category_id: number
		district_code: string
		neighborhood_code: string | null
		address: string
		lat: number
		lng: number
		// Campos opcionales adicionales del backend
		load_type?: string | null
		direction?: string | null
		subtype?: string | null
		placement_type?: string | null
		notes?: string | null
		bus_stop?: string | null
		interurban_node?: string | null
	}
	geometry: {
		type: 'Point'
		coordinates: LngLat
	}
}

export enum MapLocationType {
	DISTRICTS = 'districts',
	NEIGHBORHOODS = 'neighborhoods',
	BINS = 'bins',
}

export enum MarkerType {
	GENERAL = 'general',
	BIN = 'bin',
}

export type LngLat = [number, number]
export type LngLatBounds = [LngLat, LngLat]
export type LngLatBoundsLike = LngLatBounds | [number, number, number, number]

export interface BottomSheetState {
	markerType: MarkerType
	selectedBin: BinPoint | null
}

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
	GENERAL = 8,
	DISTRICT = 11, // Zoom inicial para ver toda Madrid
	NEIGHBORHOOD = 13,
	BINS = 16,
}

export interface MapViewport {
	zoom: number
	bounds: LngLatBounds | null // [sw, ne] formato Mapbox estándar
	center: {
		lat: number
		lng: number
	} | null
}
