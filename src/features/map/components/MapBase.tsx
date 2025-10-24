import PerformanceOverlay from '@/shared/components/perf/PerformanceOverlay' //}from 'react'
import { ANIMATION_DURATION_MS } from '@map/constants/clustering'
import {
	COMPASS_POSITION,
	INITIAL_BOUNDS,
	INITIAL_CENTER,
	IDLE_THROTTLE_MS,
} from '@map/constants/map'
import {
	calculatePoints,
	createFallbackBounds,
	hasViewportChanged,
} from '@map/services/mapService'
import { useMapBottomSheetStore } from '@map/stores/mapBottomSheetStore'
import { useMapCameraStore } from '@map/stores/mapCameraStore'
import { useMapChipsMenuStore } from '@map/stores/mapChipsMenuStore'
import { useMapNavigationStore } from '@map/stores/mapNavigationStore'
import { useMapStyleStore } from '@map/stores/mapStyleStore'
import { useMapViewportStore } from '@map/stores/mapViewportStore'
import { useUserLocationFABStore } from '@map/stores/userLocationFABStore'
import { useUserLocationStore } from '@map/stores/userLocationStore'
import { mapStyles } from '@map/styles/mapStyles'
import { LngLatBounds, MapZoomLevels } from '@map/types/mapData'
import { Camera, MapView } from '@rnmapbox/maps'
import { PermissionStatus } from 'expo-location'
import { memo, Profiler, useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { useMapBinsStore } from '../stores/mapBinsStore'
// import SuperclusterMarkers from './markers/SuperclusterMarkers'
import UserLocationMarker from './markers/UserLocationMarker'
import MapRouteLayer from './MapRouteLayer'
import MapBinsLayer from './MapBinsLayer'

const onRenderProfiler: React.ProfilerOnRenderCallback = (
	id,
	phase,
	actualDuration,
	baseDuration,
	startTime,
	commitTime,
) => {
	if (!__DEV__) return
	const thresholdMs = 8 // ajusta umbral si quieres
	if (actualDuration > thresholdMs) {
		// Log compacto
		console.log(
			`[Profiler][${id}] phase=${phase} actual=${actualDuration.toFixed(
				2,
			)}ms base=${baseDuration.toFixed(2)}ms start=${startTime.toFixed(
				1,
			)} commit=${commitTime.toFixed(1)}`,
		)
	}
}

const MapBase = () => {
	const mapRef = useRef<MapView | null>(null)
	const cameraRef = useRef<Camera | null>(null)
	const mapInitializedRef = useRef<boolean>(false)
	const lastIdleUpdateRef = useRef<number>(0)
	const isAnimatingRef = useRef(false)
	const [isMapLoaded, setIsMapLoaded] = useState(false)
	const [mapLoadError, setMapLoadError] = useState<string | null>(null)

	const { isUserLocationFABActivated, isManuallyActivated } =
		useUserLocationFABStore()
	const {
		requestPermissions,
		startTracking,
		stopTracking,
		getCurrentLocation,
	} = useUserLocationStore()
	const { route, hasActiveRoute } = useMapNavigationStore()
	const { selectedEndPoint } = useMapChipsMenuStore()
	const {
		setZoom,
		setBounds,
		setCenter,
		viewport,
		shouldAnimate,
		isProgrammaticMove,
		resetAnimation,
		resetProgrammaticMove,
	} = useMapViewportStore()
	const { setCameraRef } = useMapCameraStore()
	const { currentStyle } = useMapStyleStore()
	const { markerState } = useMapBottomSheetStore()

	const handleMapLoadingError = (error: any) => {
		console.error('Error al cargar mapa:', error)
		setMapLoadError('Error al cargar el mapa. Intenta de nuevo.')
	}

	const handleMapDidFinishLoading = () => {
		console.log('🗺️ Map loaded successfully')
		setIsMapLoaded(true)
		setMapLoadError(null)
	}

	const updateMapBounds = async (
		currentZoom: number,
		currentLat: number,
		currentLng: number,
	) => {
		const bounds = await mapRef?.current?.getVisibleBounds()

		if (bounds?.length === 2) {
			setBounds(bounds as LngLatBounds)
		}
		console.warn('⚠️ Invalid bounds, using fallback')
		const fallbackBounds = createFallbackBounds(
			currentLng,
			currentLat,
			currentZoom,
		)
		setBounds(fallbackBounds)
	}

	const shouldSkipUpdate = () => isAnimatingRef.current || !mapRef.current

	const initializeMap = () => {
		mapInitializedRef.current = true
		if (!viewport.bounds) {
			setBounds(INITIAL_BOUNDS)
		}
		if (__DEV__) {
			console.log('⏱️ [MAPIDLE] Map initialized')
		}
		lastIdleUpdateRef.current = Date.now()
		setCameraRef(cameraRef)
	}

	const shouldThrottle = () => {
		const now = Date.now()
		const timeSinceLastUpdate = now - lastIdleUpdateRef.current
		if (timeSinceLastUpdate < IDLE_THROTTLE_MS) {
			if (__DEV__) {
				console.log(
					'⏱️ [MAPIDLE] Skipping (throttled, only',
					timeSinceLastUpdate + 'ms since last update)',
				)
			}
			return true
		}
		lastIdleUpdateRef.current = now
		return false
	}

	const getMapState = async () => {
		if (!mapRef.current) return null

		const currentZoom = await mapRef.current.getZoom()
		const currentCenter = await mapRef.current.getCenter()
		console.log('[GETMAPSTATE] currentCenter', currentCenter)

		if (!currentCenter) return null

		const [lng, lat] = currentCenter
		return { zoom: currentZoom, lat, lng }
	}

	const updateViewport = async (currentState: {
		zoom: number
		lat: number
		lng: number
	}) => {
		const { zoom: currentZoom, lat, lng } = currentState

		if (__DEV__) {
			console.log('⏱️ [UPDATEVIEWPORT] Changes detected, updating viewport:', {
				zoomChanged: Math.abs((viewport.zoom ?? 0) - currentZoom) >= 0.01,
				centerChanged:
					!viewport.center ||
					Math.abs(viewport.center.lat - lat) >= 0.00001 ||
					Math.abs(viewport.center.lng - lng) >= 0.00001,
			})
		}

		setZoom(currentZoom)
		setCenter({ lat, lng })
		await updateMapBounds(currentZoom, lat, lng)

		if (__DEV__) {
			console.log('⏱️ [MAPIDLE] Viewport updated:', {
				zoom: currentZoom,
				lat,
				lng,
			})
		}
	}

	const handleMapIdle = async () => {
		if (shouldSkipUpdate()) return

		if (!mapInitializedRef.current) {
			initializeMap()
			return
		}

		if (shouldThrottle()) return

		if (__DEV__) {
			console.log('⏱️ [HANDLEMAPIDLE] Map idle - checking for changes')
		}

		try {
			const currentState = await getMapState()
			if (!currentState) return

			if (!hasViewportChanged(currentState, viewport)) {
				if (__DEV__) {
					console.log('⏱️ [HANDLEMAPIDLE] No changes detected, skipping update')
					// console.log('📐 [HANDLEMAPIDLE] newStyleLoaded', newStyleLoaded)
				}
				return
			}
			await updateViewport(currentState)
			const { allPoints } = useMapBinsStore.getState()
			if (selectedEndPoint && allPoints.length > 0) calculatePoints(viewport)
		} catch (error) {
			console.warn(`⚠️ Error getting map state:`, error)
		}
	}

	const handleUserLocationToggle = async () => {
		if (!isUserLocationFABActivated) {
			await stopTracking()
			return
		}

		const permissionStatus = await requestPermissions()
		if (permissionStatus === PermissionStatus.GRANTED) {
			await getCurrentLocation()
			await startTracking()
		}
	}

	useEffect(() => {
		handleUserLocationToggle()
	}, [isUserLocationFABActivated])

	useEffect(() => {
		if (!viewport.center || !cameraRef.current || !shouldAnimate) {
			return
		}

		isAnimatingRef.current = true
		cameraRef.current.setCamera({
			centerCoordinate: [viewport.center.lng, viewport.center.lat],
			zoomLevel: viewport.zoom,
			animationMode: 'flyTo',
			animationDuration: ANIMATION_DURATION_MS,
		})

		// Actualizar bounds después de la animación usando timeout
		const timeout = setTimeout(async () => {
			isAnimatingRef.current = false
			resetAnimation()
			resetProgrammaticMove() // ✅ Reactivar followUserLocation después de la animación

			// Actualizar bounds al finalizar animación
			if (mapRef.current) {
				try {
					const currentZoom = await mapRef.current.getZoom()
					const currentCenter = await mapRef.current.getCenter()
					if (currentCenter) {
						const [lng, lat] = currentCenter
						setCenter({ lat, lng })
						setZoom(currentZoom)

						// Obtener bounds actualizados y pasarlos al store para que los procese
						const bounds = await mapRef.current.getVisibleBounds()
						if (bounds?.length === 2) {
							// Pasar bounds raw al store para que los procese
							setBounds(bounds as LngLatBounds)
						}
					}
				} catch (error) {
					console.warn(`⚠️ Error updating bounds after animation:`, error)
				}
			}
		}, ANIMATION_DURATION_MS + 100) // Tiempo de animación + buffer

		return () => clearTimeout(timeout)
	}, [
		viewport.center,
		viewport.zoom,
		shouldAnimate,
		resetAnimation,
		resetProgrammaticMove,
	])

	return (
		<View className="flex-1">
			{!isMapLoaded && !mapLoadError && (
				<View className="absolute inset-0 z-10 items-center justify-center bg-gray-100">
					<ActivityIndicator size="large" color="#7251BC" />
					<Text className="mt-2 text-gray-600">Cargando mapa...</Text>
				</View>
			)}

			{mapLoadError && (
				<View className="absolute inset-0 z-10 items-center justify-center bg-gray-100">
					<Text className="px-4 text-center text-red-600">{mapLoadError}</Text>
					<Pressable
						className="mt-4 rounded bg-blue-500 px-4 py-2"
						onPress={() => {
							setMapLoadError(null)
							setIsMapLoaded(false)
						}}
					>
						<Text className="text-white">Reintentar</Text>
					</Pressable>
				</View>
			)}

			<MapView
				ref={mapRef}
				styleURL={currentStyle}
				style={mapStyles.map}
				scaleBarEnabled={false}
				compassEnabled
				compassPosition={COMPASS_POSITION}
				onMapIdle={handleMapIdle}
				onMapLoadingError={() => handleMapLoadingError('Map loading failed')}
				onDidFinishLoadingMap={handleMapDidFinishLoading}
				zoomEnabled
				rotateEnabled
			>
				<Camera
					ref={cameraRef}
					defaultSettings={{
						centerCoordinate: INITIAL_CENTER,
						zoomLevel: MapZoomLevels.DISTRICT,
						animationDuration: 1000,
						animationMode: 'flyTo',
					}}
					// bounds={{ ne: [40.35, -3.8], sw: [40.5, -3.6] }}
					followUserLocation={
						isUserLocationFABActivated &&
						isManuallyActivated &&
						!isProgrammaticMove
					}
					followZoomLevel={
						hasActiveRoute || markerState.selectedBin ? undefined : 15
					}
				/>

				{route && <MapRouteLayer route={route} />}

				{selectedEndPoint && (
					<Profiler id="SuperclusterMarkers" onRender={onRenderProfiler}>
						{/* <SuperclusterMarkers /> */}
						<MapBinsLayer />
					</Profiler>
				)}

				{isUserLocationFABActivated && <UserLocationMarker />}
			</MapView>

			{/* 📊 Overlay FPS/RPS SOLO en desarrollo */}
			{__DEV__ && (
				<PerformanceOverlay
					visible
					position="top-right"
					logEveryMs={5000} // logs cada 5s en consola; pon 0 para silenciar
					bufferSize={300} // ~5s a 60 fps
				/>
			)}
		</View>
	)
}

export default MapBase
