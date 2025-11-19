import { BinType } from '@/shared/types/bins'

export interface BinPoint {
	type: 'Feature'
	properties: {
		cluster: boolean
		point_count?: number
		binType: BinType
		containerId: string
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
	CONTAINERS = 'containers',
}

export enum MarkerType {
	GENERAL = 'general',
	CLUSTER = 'cluster',
	BIN = 'bin',
}

export type LngLat = [number, number]
export type LngLatBounds = [LngLat, LngLat]
export type LngLatBoundsLike = LngLatBounds | [number, number, number, number]

export interface ClusterFeatureProperties {
	cluster: true
	cluster_id?: number
	point_count: number
	point_count_abbreviated?: number
	binType?: BinType
}

export interface ClusterFeature {
	id: number
	geometry: {
		coordinates: LngLat
	}
	properties: ClusterFeatureProperties
}

export interface BottomSheetState {
	markerType: MarkerType
	selectedBin: BinPoint | null
	selectedCluster: ClusterFeature | null
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
	CLUSTER = 15,
}

export interface MapViewport {
	zoom: number
	bounds: LngLatBounds | null // [sw, ne] formato Mapbox estándar
	center: {
		lat: number
		lng: number
	} | null
}
