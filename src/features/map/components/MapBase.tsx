import {
	ANIMATION_DURATION_MS,
	CENTER_THRESHOLD,
	COMPASS_POSITION,
	INITIAL_CENTER,
} from '@map/constants/map'
import { startBinsViewportSync } from '@map/services/binsViewportSync'
import {
	showHierarchicalClusters,
	showIndividualBins,
} from '@map/services/clusterDisplayService'
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

const MapBase = () => {
	const mapViewRef = useRef<MapView | null>(null)
	const mapCameraRef = useRef<Camera | null>(null)
	const justFinishedAnimationRef = useRef(false)
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

	const [mapIsLoaded, setMapIsLoaded] = useState(false)
	const [mapLoadErrorMessage, setMapLoadErrorMessage] = useState<string | null>(
		null,
	)

	const { isUserLocationFABActivated, isManuallyActivated } =
		useUserLocationFABStore()
	const { route, hasActiveRoute } = useMapNavigationStore()
	const { selectedEndPoint } = useMapChipsMenuStore()
	const { setCameraRef: registerCameraRef } = useMapCameraStore()
	const { currentStyle } = useMapStyleStore()
	const { markerState } = useMapBottomSheetStore()
	const lastCameraEmitRef = useRef(0)

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
		startBinsViewportSync()
	}

	const onMapLoadingError = () => {
		setMapLoadErrorMessage('Error al cargar el mapa. Intenta de nuevo.')
	}

	const onTouchStart = () => {
		// Desactivar seguimiento de ubicación cuando el usuario toca el mapa (como Google Maps y Apple Maps)
		// Esto aplica tanto si fue activado manualmente como por una ruta
		const { isUserLocationFABActivated, deactivateUserLocation } =
			useUserLocationFABStore.getState()

		if (isUserLocationFABActivated) {
			console.log(
				'👆 [MAP] User touch detected, deactivating location tracking',
			)
			// Mantener la ruta activa si existe
			deactivateUserLocation({ keepRoute: true })
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
					updateValidatedViewport(
						viewport.zoom,
						viewport.bounds,
						viewport.center,
					)

					// Mostrar bins o clusters según el zoom
					const { route } = useMapNavigationStore.getState()
					if (viewport.zoom >= MapZoomLevels.NEIGHBORHOOD) {
						showIndividualBins(
							selectedEndPoint,
							viewport.zoom,
							viewport.bounds,
							viewport.center,
							route,
						)
					} else {
						showHierarchicalClusters(selectedEndPoint, viewport.zoom)
					}
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
		const { zoom, center, bounds } = event.properties
		if (zoom == null || !center) return

		// Failsafe: NO resetear isProgrammaticMove aquí
		// Se resetea en el setTimeout después de la animación (línea 105-106)
		// const viewportState = useMapViewportStore.getState()
		// if (viewportState.isProgrammaticMove && !viewportState.shouldAnimate) {
		// 	resetProgrammaticMove()
		// }

		// 🕒 Debounce para pan del usuario (esperar a que termine)
		const { isProgrammaticMove, shouldAnimate: isAnimating } =
			useMapViewportStore.getState()
		const { isUserLocationFABActivated, isManuallyActivated } =
			useUserLocationFABStore.getState()

		const isFollowingUser =
			isUserLocationFABActivated && isManuallyActivated && !isProgrammaticMove

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

		if (__DEV__) {
			console.log('📸 [CAMERA] emit', {
				zoom,
				center: centerLatLng,
				hasBounds: !!mutableBounds,
				following: isFollowingUser,
			})
		}

		// Capturar lastValidatedCenter ANTES de que setViewportBatch lo actualice
		const { lastValidatedZoom: prevZoom, lastValidatedCenter: prevCenter } =
			useMapViewportStore.getState()

		useMapViewportStore.getState().setViewportBatch({
			zoom,
			center: centerLatLng,
			...(mutableBounds ? { bounds: mutableBounds } : {}),
		})

		// Mostrar bins/clusters imperativamente cuando el usuario hace pan/zoom
		// NO ejecutar durante animaciones programáticas (se maneja en el timeout)
		// PERO sí ejecutar en el primer pan después de una animación
		const shouldUpdateDisplay =
			(!isProgrammaticMove && !isAnimating) || justFinishedAnimationRef.current

		if (shouldUpdateDisplay && mutableBounds) {
			const { selectedEndPoint } = useMapChipsMenuStore.getState()
			const { route } = useMapNavigationStore.getState()
			const lastValidatedZoom = prevZoom
			const lastValidatedCenter = prevCenter

			if (selectedEndPoint) {
				// Detectar cambios significativos de zoom, center (pan), o cruce del umbral 14
				const zoomChanged = lastValidatedZoom
					? Math.abs(lastValidatedZoom - zoom) >= 0.5
					: true
				const centerChanged = lastValidatedCenter
					? Math.abs(lastValidatedCenter.lat - centerLatLng.lat) >=
							CENTER_THRESHOLD ||
						Math.abs(lastValidatedCenter.lng - centerLatLng.lng) >=
							CENTER_THRESHOLD
					: true
				const crossedThreshold = lastValidatedZoom
					? (lastValidatedZoom < MapZoomLevels.NEIGHBORHOOD &&
							zoom >= MapZoomLevels.NEIGHBORHOOD) ||
						(lastValidatedZoom >= MapZoomLevels.NEIGHBORHOOD &&
							zoom < MapZoomLevels.NEIGHBORHOOD)
					: false

				if (
					zoomChanged ||
					centerChanged ||
					crossedThreshold ||
					justFinishedAnimationRef.current
				) {
					// Limpiar debounce anterior
					if (debounceTimerRef.current) {
						clearTimeout(debounceTimerRef.current)
					}

					// Debounce: esperar 300ms después del último evento de cámara
					// Esto evita recalcular bins mientras el usuario hace pan
					debounceTimerRef.current = setTimeout(() => {
						if (__DEV__) {
							console.log(
								'🔄 [CAMERA] User pan/zoom finished, updating display',
								{
									zoom,
									zoomChanged,
									centerChanged,
									crossedThreshold,
									justFinishedAnimation: justFinishedAnimationRef.current,
								},
							)
						}

						if (zoom >= MapZoomLevels.NEIGHBORHOOD) {
							showIndividualBins(
								selectedEndPoint,
								zoom,
								mutableBounds,
								centerLatLng,
								route,
							)
						} else {
							showHierarchicalClusters(selectedEndPoint, zoom)
						}

						// Resetear flag después de usarlo
						justFinishedAnimationRef.current = false
					}, 300) // 300ms de debounce (más tiempo = más fluido)
				}
			}
		}
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
						!isProgrammaticMove
					}
					followZoomLevel={
						hasActiveRoute || markerState.selectedBin ? undefined : 15
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
