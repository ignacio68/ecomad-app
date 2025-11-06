import {
	ANIMATION_DURATION_MS,
	MAPBOX_DOWNLOADS_TOKEN,
	NAVIGATION_PADDING_BOTTOM,
	NAVIGATION_PADDING_LEFT,
	NAVIGATION_PADDING_RIGHT,
	NAVIGATION_PADDING_TOP,
} from '@map/constants/map'

import { CLUSTER_MAX_ZOOM } from '@map/constants/clustering'
import { filterPointsForViewport } from '@map/services/binsLoader'
import { calculateAndStoreClusters } from '@map/services/clusteringService'
import { pauseViewportSync } from '@map/services/viewportSyncController'
import { useMapBinsStore } from '@map/stores/mapBinsStore'
import { useMapChipsMenuStore } from '@map/stores/mapChipsMenuStore'
import { useSuperclusterCacheStore } from '@map/stores/superclusterCacheStore'
import type { LngLat, LngLatBounds } from '@map/types/mapData'
import { MapViewport, MapZoomLevels } from '@map/types/mapData'
import type { Camera } from '@rnmapbox/maps'
import Mapbox from '@rnmapbox/maps'
import type React from 'react'

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
const getDynamicBuffer = (zoom: number): number => {
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

const calculateBoundsForTwoPoints = (
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
	duration: number = ANIMATION_DURATION_MS,
): void => {
	if (!cameraRef.current) {
		console.warn('⚠️ Camera ref no disponible')
		return
	}

	try {
		pauseViewportSync(duration + 150)
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
		duration = ANIMATION_DURATION_MS,
	} = options

	if (!cameraRef.current) {
		console.warn('⚠️ Camera ref no disponible')
		return
	}

	const bounds = calculateBoundsForTwoPoints(origin, destination)
	const [sw, ne] = bounds

	try {
		pauseViewportSync(duration + 200)
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

export const calculatePoints = (viewport: MapViewport) => {
	try {
		const { allPoints: currentPoints } = useMapBinsStore.getState()
		const { selectedEndPoint } = useMapChipsMenuStore.getState()
		const { setDisplayClusters, setSuperclusterInstance } =
			require('@map/stores/mapClustersStore').useMapClustersStore.getState()
		const { zoom, bounds, center } = viewport

		// Modo mega-cluster: ignorar bounds y filtrar, usar todos los puntos
		if (zoom <= MapZoomLevels.GENERAL) {
			useMapBinsStore.getState().setFilteredPoints(currentPoints)
			calculateAndStoreClusters(currentPoints, zoom, null)
			return
		}

		// Congelar clusters entre DISTRICT (11) y CLUSTER_MAX_ZOOM (13): reutilizar cache si existe
		if (selectedEndPoint && zoom <= CLUSTER_MAX_ZOOM) {
			const cached = useSuperclusterCacheStore
				.getState()
				.getClustersCache(selectedEndPoint, Math.floor(zoom))
			if (cached && cached.length > 0) {
				// Usar clusters cacheados tal cual (ya resueltos), sin reclustering
				setDisplayClusters(cached)
				setSuperclusterInstance(null)
				return
			}
		}

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
