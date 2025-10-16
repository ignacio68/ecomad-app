import { BinType } from '@/shared/types/bins'

export interface BinPoint {
	type: 'Feature'
	properties: {
		cluster: boolean
		point_count?: number
		binType: BinType
		containerId: string
		distrito: string
		barrio: string
		direccion: string
		latitud: number
		longitud: number
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
	DISTRICT = 11, // Zoom inicial para ver toda Madrid
	NEIGHBORHOOD = 14,
	CONTAINER = 16,
	CLUSTER = 15, // Aumentado para mantener clusters durante zoom programático
}
