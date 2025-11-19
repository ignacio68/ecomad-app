import {
	ANIMATION_DURATION_MS,
	COMPASS_POSITION,
	INITIAL_BOUNDS,
	INITIAL_CENTER,
} from '@map/constants/map'
import { startBinsViewportSync } from '@map/services/binsViewportSync'
import { useMapBottomSheetStore } from '@map/stores/mapBottomSheetStore'
import { useMapCameraStore } from '@map/stores/mapCameraStore'
import { useMapChipsMenuStore } from '@map/stores/mapChipsMenuStore'
import { useMapNavigationStore } from '@map/stores/mapNavigationStore'
import { useMapStyleStore } from '@map/stores/mapStyleStore'
import { useMapViewportStore } from '@map/stores/mapViewportStore'
import { useUserLocationFABStore } from '@map/stores/userLocationFABStore'
import { mapStyles } from '@map/styles/mapStyles'
import { LngLatBounds, MapZoomLevels } from '@map/types/mapData'
import { Camera, MapView, type MapState } from '@rnmapbox/maps'
import { memo, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import MapBinsLayerV2 from './MapBinsLayerV2'
import MapWalkingRouteLayer from './MapRouteLayer/MapWalkingRouteLayer'
import UserLocationMarker from './markers/UserLocationMarker'

const FOLLOWING_CAMERA_THROTTLE_MS = 250
const ZOOM_EPSILON = 0.01
const FOLLOW_CENTER_EPSILON = 0.00001

const MapBase = () => {
	const mapViewRef = useRef<MapView | null>(null)
	const mapCameraRef = useRef<Camera | null>(null)
	const justFinishedAnimationRef = useRef(false)

	const [mapIsLoaded, setMapIsLoaded] = useState(false)
	const [mapLoadErrorMessage, setMapLoadErrorMessage] = useState<string | null>(
		null,
	)

	const {
		isUserLocationFABActivated,
		isManuallyActivated,
		isUserLocationCentered,
	} = useUserLocationFABStore()
	const { route, hasActiveRoute } = useMapNavigationStore()
	const { selectedEndPoint } = useMapChipsMenuStore()
	const { setCameraRef: registerCameraRef } = useMapCameraStore()
	const { currentStyle } = useMapStyleStore()
	const { markerState } = useMapBottomSheetStore()
	const lastCameraEmitRef = useRef(0)
	const lastFollowCenterRef = useRef<{ lat: number; lng: number } | null>(null)

	const {
		shouldAnimate,
		resetAnimation,
		resetProgrammaticMove,
		isProgrammaticMove,
	} = useMapViewportStore()

	const onMapLoaded = () => {
		setMapIsLoaded(true)
		setMapLoadErrorMessage(null)
		registerCameraRef(mapCameraRef)
		if (__DEV__) {
			console.log('🗺️ [MapBase] onMapLoaded → startBinsViewportSync()')
		}
		if (mapCameraRef.current) {
			mapCameraRef.current.setCamera({
				centerCoordinate: INITIAL_CENTER,
				zoomLevel: MapZoomLevels.DISTRICT,
				animationDuration: 0,
				animationMode: 'flyTo',
			})
		}
		useMapViewportStore.getState().setViewportBatch({
			zoom: MapZoomLevels.DISTRICT,
			center: { lat: INITIAL_CENTER[1], lng: INITIAL_CENTER[0] },
			bounds: INITIAL_BOUNDS,
		})
		startBinsViewportSync()
	}

	const onMapLoadingError = () => {
		setMapLoadErrorMessage('Error al cargar el mapa. Intenta de nuevo.')
	}

	const onTouchStart = () => {
		// Desanclar seguimiento cuando el usuario interactúa con el mapa (similar a Google/Apple Maps)
		const {
			isUserLocationFABActivated: activated,
			isUserLocationCentered,
			setIsUserLocationCentered,
		} = useUserLocationFABStore.getState()

		if (activated && isUserLocationCentered) {
			console.log('👆 [MAP] User touch detected, pausing user follow mode')
			setIsUserLocationCentered(false)
		}
	}

	useEffect(() => {
		if (!shouldAnimate) return
		const { viewport } = useMapViewportStore.getState()
		const { center, zoom } = viewport
		if (!center || !mapCameraRef.current) return

		if (__DEV__)
			console.log('[MapBase] 🎬 Starting camera animation:', {
				shouldAnimate,
				targetZoom: zoom,
				targetCenter: center,
			})

		try {
			mapCameraRef.current.setCamera({
				centerCoordinate: [center.lng, center.lat],
				zoomLevel: zoom,
				animationMode: 'flyTo',
				animationDuration: ANIMATION_DURATION_MS,
			})

			// Resetear flags y mostrar bins/clusters después de la animación
			setTimeout(() => {
				if (__DEV__)
					console.log('[MapBase] ⏰ Animation timeout reached, resetting flags')

				resetAnimation()
				resetProgrammaticMove()
				justFinishedAnimationRef.current = true
				// Resetear throttle para permitir pans inmediatos después de la animación
				lastCameraEmitRef.current = 0

				// Mostrar bins/clusters imperativamente según el zoom final
				const { viewport, updateValidatedViewport } =
					useMapViewportStore.getState()
				const { selectedEndPoint } = useMapChipsMenuStore.getState()

				if (__DEV__)
					console.log('[MapBase] 🔄 Showing bins/clusters after animation:', {
						zoom: viewport.zoom,
						center: viewport.center,
						hasBounds: !!viewport.bounds,
						selectedEndPoint,
					})

				if (
					viewport.zoom &&
					viewport.bounds &&
					viewport.center &&
					selectedEndPoint
				) {
					// Actualizar viewport validated
					// binsViewportSync se encargará de actualizar los bins cuando detecte el cambio
					updateValidatedViewport(
						viewport.zoom,
						viewport.bounds,
						viewport.center,
					)
				}

				if (__DEV__)
					console.log(
						'[MapBase] ✅ Animation finished, bins/clusters displayed',
					)
			}, ANIMATION_DURATION_MS + 100)
		} catch (error) {
			console.error('❌ [MapBase] Error setting camera:', error)
			resetAnimation()
			resetProgrammaticMove()
		}
	}, [shouldAnimate, resetAnimation, resetProgrammaticMove])

	const onCameraChanged = (event: MapState) => {
		if (!mapIsLoaded) {
			return
		}
		const { zoom, center, bounds } = event.properties
		if (zoom == null || !center) return

		// 🕒 Debounce para pan del usuario (esperar a que termine)
		const { isProgrammaticMove } = useMapViewportStore.getState()
		const {
			isUserLocationFABActivated,
			isManuallyActivated,
			isUserLocationCentered,
		} = useUserLocationFABStore.getState()

		const isFollowingUser =
			isUserLocationFABActivated &&
			isManuallyActivated &&
			isUserLocationCentered &&
			!isProgrammaticMove

		if (!isFollowingUser) {
			lastCameraEmitRef.current = 0
			lastFollowCenterRef.current = null
		}

		// ✅ center mutable
		const centerLatLng = { lat: center[1], lng: center[0] }

		// ✅ bounds mutables (tu tipo LngLatBounds = [LngLat, LngLat])
		let mutableBounds: LngLatBounds | undefined
		if (bounds?.sw && bounds?.ne) {
			mutableBounds = [
				[bounds.sw[0], bounds.sw[1]],
				[bounds.ne[0], bounds.ne[1]],
			]
		}

		const prevViewport = useMapViewportStore.getState().viewport
		const zoomChangedSignificantly =
			prevViewport.zoom == null ||
			Math.abs((prevViewport.zoom ?? 0) - zoom) >= ZOOM_EPSILON

		let shouldSkip = false
		if (isFollowingUser) {
			const prevCenter = lastFollowCenterRef.current
			const now = Date.now()

			if (!zoomChangedSignificantly) {
				if (
					prevCenter &&
					Math.abs(prevCenter.lat - centerLatLng.lat) < FOLLOW_CENTER_EPSILON &&
					Math.abs(prevCenter.lng - centerLatLng.lng) < FOLLOW_CENTER_EPSILON
				) {
					shouldSkip = true
				} else if (
					lastCameraEmitRef.current !== 0 &&
					now - lastCameraEmitRef.current < FOLLOWING_CAMERA_THROTTLE_MS
				) {
					shouldSkip = true
				}
			}

			lastFollowCenterRef.current = centerLatLng

			if (!shouldSkip) {
				lastCameraEmitRef.current = now
			}
		}

		if (shouldSkip) {
			return
		}

		if (__DEV__) {
			console.log('📸 [CAMERA] emit', {
				zoom,
				center: centerLatLng,
				hasBounds: !!mutableBounds,
				following: isFollowingUser,
			})
		}

		useMapViewportStore.getState().setViewportBatch({
			zoom,
			center: centerLatLng,
			...(mutableBounds ? { bounds: mutableBounds } : {}),
		})
	}

	return (
		<View className="flex-1">
			{!mapIsLoaded && !mapLoadErrorMessage && (
				<View className="absolute inset-0 z-10 items-center justify-center bg-gray-100">
					<ActivityIndicator size="large" />
					<Text className="mt-2 text-gray-600">Cargando mapa...</Text>
				</View>
			)}

			{mapLoadErrorMessage && (
				<View className="absolute inset-0 z-10 items-center justify-center bg-gray-100">
					<Text className="px-4 text-center text-red-600">
						{mapLoadErrorMessage}
					</Text>
				</View>
			)}

			<MapView
				ref={mapViewRef}
				styleURL={currentStyle}
				style={mapStyles.map}
				scaleBarEnabled={false}
				compassEnabled
				compassPosition={COMPASS_POSITION}
				onMapLoadingError={onMapLoadingError}
				onDidFinishLoadingMap={onMapLoaded}
				onCameraChanged={onCameraChanged}
				onTouchStart={onTouchStart}
				zoomEnabled
				rotateEnabled
			>
				<Camera
					ref={mapCameraRef}
					defaultSettings={{
						centerCoordinate: INITIAL_CENTER,
						zoomLevel: MapZoomLevels.DISTRICT,
						animationDuration: 1000,
						animationMode: 'flyTo',
					}}
					followUserLocation={
						isUserLocationFABActivated &&
						isManuallyActivated &&
						isUserLocationCentered &&
						!isProgrammaticMove
					}
					followZoomLevel={
						hasActiveRoute ||
						markerState.selectedBin ||
						(isUserLocationFABActivated && isManuallyActivated)
							? undefined
							: 15
					}
				/>
				{selectedEndPoint && <MapBinsLayerV2 />}
				{route && <MapWalkingRouteLayer route={route} />}
				{isUserLocationFABActivated && <UserLocationMarker />}
			</MapView>
		</View>
	)
}

export default memo(MapBase)
