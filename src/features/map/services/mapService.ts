import {
	MAPBOX_DOWNLOADS_TOKEN,
	NAVIGATION_PADDING_BOTTOM,
	NAVIGATION_PADDING_LEFT,
	NAVIGATION_PADDING_RIGHT,
	NAVIGATION_PADDING_TOP,
} from '@map/constants/map'

import { filterPointsForViewport } from '@map/services/binsLoader'
import { useMapBinsStore } from '@map/stores/mapBinsStore'
import type { LngLat, LngLatBounds } from '@map/types/mapData'
import { MapViewport } from '@map/types/mapData'
import type { Camera } from '@rnmapbox/maps'
import Mapbox from '@rnmapbox/maps'
import type React from 'react'
import { calculateAndStoreClusters } from './clusteringService'

export const setMapboxAccessToken = async (): Promise<boolean> => {
	try {
		if (!MAPBOX_DOWNLOADS_TOKEN) {
			console.warn('Mapbox token no encontrado')
			return false
		}

		// Verificar si ya está configurado (solo si el método existe)
		try {
			const currentToken = await Mapbox.getAccessToken?.()
			if (currentToken === MAPBOX_DOWNLOADS_TOKEN) {
				console.log('🗺️ Mapbox token ya configurado')
				return true
			}
		} catch (error) {
			console.log(
				'🗺️ getAccessToken no disponible, configurando token...',
				error,
			)
		}

		Mapbox.setAccessToken(MAPBOX_DOWNLOADS_TOKEN)
		console.log('🗺️ Mapbox token configurado correctamente')
		return true
	} catch (error) {
		console.error('Error al configurar Mapbox token:', error)
		return false
	}
}

// Función auxiliar para obtener buffer dinámico según zoom
export const getDynamicBuffer = (zoom: number): number => {
	if (zoom >= 16) return 0.003 // Buffer pequeño para zoom alto
	if (zoom >= 14) return 0.008 // Buffer mediano para zoom medio
	if (zoom >= 12) return 0.012 // Buffer grande para zoom bajo-medio
	return 0.015 // Buffer grande para zoom muy bajo
}

// Función auxiliar para expandir bounds con buffer dinámico
export const expandBoundsWithBuffer = (
	rawBounds: LngLatBounds, // Raw bounds from getVisibleBounds()
	zoom: number,
): LngLatBounds => {
	const buffer = getDynamicBuffer(zoom)
	const [point1, point2] = rawBounds
	const sw = [Math.min(point1[0], point2[0]), Math.min(point1[1], point2[1])]
	const ne = [Math.max(point1[0], point2[0]), Math.max(point1[1], point2[1])]

	return [
		[sw[0] - buffer, sw[1] - buffer], // sw expandido
		[ne[0] + buffer, ne[1] + buffer], // ne expandido
	]
}

// Función auxiliar para crear bounds de fallback
export const createFallbackBounds = (
	lng: number,
	lat: number,
	zoom: number,
): LngLatBounds => {
	const latDelta = 180 / Math.pow(2, zoom)
	const lngDelta = 360 / Math.pow(2, zoom)
	const buffer = getDynamicBuffer(zoom)

	return [
		[lng - lngDelta / 2 - buffer, lat - latDelta / 2 - buffer], // sw expandido
		[lng + lngDelta / 2 + buffer, lat + latDelta / 2 + buffer], // ne expandido
	]
}

// Función auxiliar para verificar throttling de bounds
export const createThrottle = (throttleMs: number) => {
	let lastUpdateTime = 0

	return (): boolean => {
		const now = Date.now()
		const timeSinceLastUpdate = now - lastUpdateTime

		if (timeSinceLastUpdate > throttleMs) {
			lastUpdateTime = now
			return true
		}
		return false
	}
}

/**
 * Calcula los bounds que contienen dos puntos (origen y destino)
 */
export const calculateBoundsForTwoPoints = (
	origin: LngLat,
	destination: LngLat,
): LngLatBounds => {
	const minLng = Math.min(origin[0], destination[0])
	const maxLng = Math.max(origin[0], destination[0])
	const minLat = Math.min(origin[1], destination[1])
	const maxLat = Math.max(origin[1], destination[1])

	return [
		[minLng, minLat], // SW (southwest)
		[maxLng, maxLat], // NE (northeast)
	]
}

/**
 * Centra la cámara en un punto específico con zoom
 * @param cameraRef - Referencia a la cámara de Mapbox
 * @param center - Coordenadas del centro [lng, lat]
 * @param zoom - Nivel de zoom
 * @param duration - Duración de la animación en ms
 */
export const flyToPoint = (
	cameraRef: React.RefObject<Camera | null>,
	center: LngLat,
	zoom: number,
	duration: number = 800,
): void => {
	if (!cameraRef.current) {
		console.warn('⚠️ Camera ref no disponible')
		return
	}

	try {
		cameraRef.current.setCamera({
			centerCoordinate: center,
			zoomLevel: zoom,
			animationMode: 'flyTo',
			animationDuration: duration,
		})
	} catch (error) {
		console.error('❌ Error al mover cámara:', error)
	}
}

interface FitBoundsOptions {
	paddingTop?: number
	paddingBottom?: number
	paddingLeft?: number
	paddingRight?: number
	duration?: number
}

/**
 * Ajusta la cámara para mostrar dos puntos con padding usando fitBounds
 * @param cameraRef - Referencia a la cámara de Mapbox
 * @param origin - Coordenadas del punto de origen [lng, lat]
 * @param destination - Coordenadas del punto de destino [lng, lat]
 * @param options - Opciones de padding y duración
 */
export const fitBoundsToTwoPoints = (
	cameraRef: React.RefObject<Camera | null>,
	origin: LngLat,
	destination: LngLat,
	options: FitBoundsOptions = {},
): void => {
	const {
		paddingTop = NAVIGATION_PADDING_TOP,
		paddingBottom = NAVIGATION_PADDING_BOTTOM,
		paddingLeft = NAVIGATION_PADDING_LEFT,
		paddingRight = NAVIGATION_PADDING_RIGHT,
		duration = 1000,
	} = options

	if (!cameraRef.current) {
		console.warn('⚠️ Camera ref no disponible')
		return
	}

	const bounds = calculateBoundsForTwoPoints(origin, destination)
	const [sw, ne] = bounds

	try {
		cameraRef.current.fitBounds(
			ne,
			sw,
			[paddingTop, paddingRight, paddingBottom, paddingLeft],
			duration,
		)
	} catch (error) {
		console.error('❌ Error al ajustar bounds:', error)
	}
}

export const hasViewportChanged = (
	currentState: { zoom: number; lat: number; lng: number },
	viewport: MapViewport,
) => {
	const { zoom: currentZoom, lat, lng } = currentState

	// ✅ Si no hay viewport inicial, no considerar como cambio
	if (!viewport.center || viewport.zoom === undefined) {
		return false
	}

	const zoomChanged = Math.abs(viewport.zoom - currentZoom) >= 0.01
	const centerChanged =
		Math.abs(viewport.center.lat - lat) >= 0.00001 ||
		Math.abs(viewport.center.lng - lng) >= 0.00001

	return zoomChanged || centerChanged
}

export const calculatePoints = (viewport: MapViewport) => {
	try {
		// Obtener allPoints actual del store para evitar dependencia reactiva
		const { allPoints: currentPoints } = useMapBinsStore.getState()
		const { zoom, bounds, center } = viewport

		if (zoom <= 12) {
			console.log('🚫 [VIEWPORT] Low zoom, skipping points calculation')
			return
		}

		// ✅ bounds seguros (si vienen nulos, generamos fallback con buffer)
		const safeBounds: LngLatBounds =
			bounds ?? createFallbackBounds(center!.lng, center!.lat, zoom)

		const filtered = filterPointsForViewport(
			currentPoints,
			zoom,
			safeBounds,
			center,
		)

		console.log('✅ [VIEWPORT] Filtered:', {
			input: currentPoints.length,
			output: filtered.length,
			ratio: ((filtered.length / currentPoints.length) * 100).toFixed(1) + '%',
		})

		useMapBinsStore.getState().setFilteredPoints(filtered)

		// ✅ CLUSTERING IMPERATIVO: Calcular clusters y guardar en store
		calculateAndStoreClusters(filtered, zoom, bounds)
	} catch (error) {
		console.error('❌ [VIEWPORT] Error filtering:', error)
		useMapBinsStore.getState().setFilteredPoints([])
	}
}
