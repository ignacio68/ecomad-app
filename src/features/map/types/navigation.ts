import { Feature, LineString } from 'geojson'
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

export interface RouteGeometry extends Feature<LineString> {
	properties: {
		distance: number
		duration: number
	}
}

export interface RouteData {
	geometry: RouteGeometry
	distance: number
	duration: number
	steps: RouteStep[]
}

export interface RouteResponse extends RouteData {
	legs: any[]
}

export enum RouteProfile {
	WALKING = 'walking',
	CYCLING = 'cycling',
	DRIVING = 'driving',
	DRIVING_TRAFFIC = 'driving-traffic',
}
