import { Feature, GeoJsonProperties, LineString, MultiLineString } from 'geojson'
import { LngLat } from './mapData'

export interface RouteStep {
	distance: number
	duration: number
	instruction: string
	maneuver: {
		type: string
		modifier?: string
		location: LngLat
	}
}

export interface RouteGeometryFeature extends Feature<LineString |  MultiLineString, GeoJsonProperties> {
	properties: {
		distance: number
		duration: number
	}
}


export enum RouteProfile {
	WALKING = 'walking',
	CYCLING = 'cycling',
	DRIVING = 'driving',
	DRIVING_TRAFFIC = 'driving-traffic',
}

export interface BasicRouteData {
		geometry: RouteGeometryFeature
		distance: number
		duration: number
		steps: RouteStep[]
}

export interface RouteResponse extends BasicRouteData {
	legs: any[]
}
export interface RouteData extends RouteResponse {
	id: string
	profile: RouteProfile
}


