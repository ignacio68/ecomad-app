import { ANIMATION_DURATION_MS } from '@map/constants/clustering'
import {
	COMPASS_POSITION,
	INITIAL_BOUNDS,
	INITIAL_CENTER,
} from '@map/constants/map'
import { createFallbackBounds } from '@map/services/mapService'
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
import { memo, useCallback, useEffect, useRef, Profiler } from 'react'
import PerformanceOverlay from '@/shared/components/perf/PerformanceOverlay' //}from 'react'
import { useMapViewportChanges } from './hooks/useMapViewportChanges'
import SuperclusterMarkers from './markers/SuperclusterMarkers'
import UserLocationMarker from './markers/UserLocationMarker'
import RouteLayer from './RouteLayer'
import { View } from 'react-native'

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

const MapBase = memo(() => {
	const mapRef = useRef<MapView | null>(null)
	const cameraRef = useRef<Camera | null>(null)
	const isAnimatingRef = useRef(false)

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

	// Hook para validar cambios de viewport
	useMapViewportChanges()

	useEffect(() => {
		setCameraRef(cameraRef)
	}, [setCameraRef])

	useEffect(() => {
		if (route) {
			console.log('🗺️ MapBase: Route updated', {
				distance: route.distance,
				duration: route.duration,
			})
		}
	}, [route])

	const handleMapLoadingError = useCallback(() => {
		console.error('Error al cargar mapa')
	}, [])

	const updateMapBounds = useCallback(
		async (currentZoom: number, currentLat: number, currentLng: number) => {
			if (!mapRef.current) return

			try {
				const bounds = await mapRef.current.getVisibleBounds()

				if (bounds?.length === 2) {
					setBounds(bounds as LngLatBounds)
				} else {
					console.warn('⚠️ Invalid bounds, using fallback')
					const fallbackBounds = createFallbackBounds(
						currentLng,
						currentLat,
						currentZoom,
					)
					setBounds(fallbackBounds)
				}
			} catch (error) {
				console.warn('⚠️ Error getting bounds, using fallback:', error)
				const fallbackBounds = createFallbackBounds(
					currentLng,
					currentLat,
					currentZoom,
				)
				setBounds(fallbackBounds)
			}
		},
		[setBounds],
	)

	const mapInitializedRef = useRef<boolean>(false)
	// Ref para throttle de onMapIdle
	const lastIdleUpdateRef = useRef<number>(0)
	const IDLE_THROTTLE_MS = 200 // Mínimo tiempo entre actualizaciones

	const handleMapIdle = useCallback(async () => {
		if (isAnimatingRef.current || !mapRef.current) {
			console.log('⏱️ [MAPIDLE] Skipping (animating or no map ref)')
			return
		}

		if (!mapInitializedRef.current) {
			mapInitializedRef.current = true
			if (!viewport.bounds) {
				setBounds(INITIAL_BOUNDS)
			}
			console.log('⏱️ [MAPIDLE] Map initialized')
			lastIdleUpdateRef.current = Date.now()
			return
		}

		// ✅ Throttle: Solo actualizar si han pasado más de 200ms desde la última actualización
		const now = Date.now()
		const timeSinceLastUpdate = now - lastIdleUpdateRef.current
		if (timeSinceLastUpdate < IDLE_THROTTLE_MS) {
			console.log(
				'⏱️ [MAPIDLE] Skipping (throttled, only',
				timeSinceLastUpdate + 'ms since last update)',
			)
			return
		}

		lastIdleUpdateRef.current = now

		// Actualización normal del viewport cuando el mapa está idle
		console.log('⏱️ [MAPIDLE] Map idle - checking for changes')

		try {
			const currentZoom = await mapRef.current.getZoom()
			const currentCenter = await mapRef.current.getCenter()

			if (!currentCenter) return

			const [lng, lat] = currentCenter

			// ✅ Verificar si realmente cambió algo antes de actualizar
			const zoomChanged = Math.abs((viewport.zoom ?? 0) - currentZoom) >= 0.01
			const centerChanged =
				!viewport.center ||
				Math.abs(viewport.center.lat - lat) >= 0.00001 ||
				Math.abs(viewport.center.lng - lng) >= 0.00001

			if (!zoomChanged && !centerChanged) {
				console.log('⏱️ [MAPIDLE] No changes detected, skipping update')
				return
			}

			console.log('⏱️ [MAPIDLE] Changes detected, updating viewport:', {
				zoomChanged,
				centerChanged,
			})

			setZoom(currentZoom)
			setCenter({ lat, lng })
			await updateMapBounds(currentZoom, lat, lng)

			console.log('⏱️ [MAPIDLE] Viewport updated:', {
				zoom: currentZoom,
				lat,
				lng,
			})
		} catch (error) {
			console.warn(`⚠️ Error getting map state:`, error)
		}
	}, [
		setBounds,
		viewport.bounds,
		viewport.zoom,
		viewport.center,
		setZoom,
		setCenter,
		updateMapBounds,
	])

	useEffect(() => {
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

		handleUserLocationToggle()
	}, [
		isUserLocationFABActivated,
		requestPermissions,
		startTracking,
		stopTracking,
		getCurrentLocation,
	])

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
		<MapView
			ref={mapRef}
			styleURL={currentStyle}
			style={mapStyles.map}
			scaleBarEnabled={false}
			compassEnabled
			compassPosition={COMPASS_POSITION}
			onMapIdle={handleMapIdle}
			onMapLoadingError={handleMapLoadingError}
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
					!hasActiveRoute &&
					!isProgrammaticMove
				}
				followZoomLevel={15}
			/>

			{selectedEndPoint && (
				<Profiler id="SuperclusterMarkers" onRender={onRenderProfiler}>
					<SuperclusterMarkers />
				</Profiler>
			)}

			{route && <RouteLayer route={route} />}

			{isUserLocationFABActivated && <UserLocationMarker />}
		</MapView>

		 {/* 📊 Overlay FPS/RPS SOLO en desarrollo */}
      {__DEV__ && (
        <PerformanceOverlay
          visible
          position="top-right"
          logEveryMs={5000}   // logs cada 5s en consola; pon 0 para silenciar
          bufferSize={300}    // ~5s a 60 fps
        />
	)
	}
	</View>
	)
})
MapBase.displayName = 'MapBase'

export default MapBase
