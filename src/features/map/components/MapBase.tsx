import Mapbox, {
	Camera,
	LocationPuck,
	MapView,
	UserLocation,
} from '@rnmapbox/maps'
import React, { useCallback, useEffect, useRef } from 'react'
import {
	ANIMATION_DURATION_MS,
	COMPASS_POSITION,
	DEFAULT_ZOOM_FALLBACK,
	ZOOM_CHANGE_THRESHOLD,
} from '../constants/clustering'
import { INITIAL_BOUNDS, INITIAL_CENTER } from '../constants/map'
import { useMapStore } from '../stores/mapStore'
import { useMapViewportStore } from '../stores/mapViewportStore'
import { useLocationStore } from '../stores/userLocationStore'
import { mapStyles } from '../styles/mapStyles'
import { LngLatBounds, MapZoomLevels } from '../types/mapData'
import { SuperclusterMarkers } from './SuperclusterMarkers'

const MapBase = React.memo(() => {
	const mapRef = useRef<MapView | null>(null)
	const cameraRef = useRef<Camera | null>(null)
	const isAnimatingRef = useRef(false)
	// Eliminado lastLocationRef por no utilizarse
	const userLocationRef = useRef<UserLocation | null>(null)
	// Eliminado lastFocusedRef por no utilizarse

	const { isUserLocationFABActivated } = useMapStore()
	const { setPermissions, startWatching, stopWatching } = useLocationStore()
	const {
		setZoom,
		setBounds,
		setCenter,
		viewport,
		shouldAnimate,
		resetAnimation,
	} = useMapViewportStore()
	// Eliminado markerState por no utilizarse

	// Ref para controlar si ya se ejecutó handleMapIdle
	const mapIdleExecutedRef = useRef<boolean>(false)

	// Memoizar los callbacks para evitar re-renderizados
	const handleMapIdle = useCallback(() => {
		// Solo ejecutar una vez al cargar el mapa
		if (mapIdleExecutedRef.current) {
			console.log('🗺️ Map idle - already executed, skipping')
			return
		}

		console.log('🗺️ Mapa cargado correctamente - first time only')
		mapIdleExecutedRef.current = true

		// Solo establecer bounds inicial si no existen
		if (__DEV__) {
			console.log('🔍 Current viewport.bounds:', viewport.bounds)
			console.log('🔍 Current viewport.center:', viewport.center)
		}

		if (!viewport.bounds) {
			const initialBounds = INITIAL_BOUNDS
			console.log('📍 Setting initial bounds (first time only):', initialBounds)
			setBounds(initialBounds)
		}
	}, [setBounds, viewport.bounds, viewport.center])

	const handleMapLoadingError = useCallback(() => {
		console.error('Error al cargar mapa')
	}, [])

	// Ref para throttling de eventos de cámara (solo para bounds)
	const lastBoundsUpdateRef = useRef<number>(0)
	const BOUNDS_THROTTLE_MS = 50 // Actualizar bounds máximo cada 50ms para mejor respuesta

	const handleCameraChanged = useCallback(
		async (state: any) => {
			if (isAnimatingRef.current) {
				return
			}

			// Usar métodos nativos para obtener zoom y center precisos
			if (mapRef.current) {
				try {
					// Obtener zoom actual del mapa
					const currentZoom = await mapRef.current.getZoom()
					if (__DEV__) {
						console.log(`🔍 Camera changed - zoom: ${currentZoom}`)
					}
					setZoom(currentZoom)

					// Obtener center actual del mapa
					const currentCenter = await mapRef.current.getCenter()
					if (currentCenter) {
						const [lng, lat] = currentCenter
						setCenter({ lat, lng })

						// Throttling solo para bounds (cálculos más pesados)
						const now = Date.now()
						const timeSinceLastUpdate = now - lastBoundsUpdateRef.current
						const shouldUpdateBounds = timeSinceLastUpdate > BOUNDS_THROTTLE_MS

						if (__DEV__) {
							console.log(
								`🔍 Step 1 - Bounds throttling: timeSinceLastUpdate=${timeSinceLastUpdate}ms, shouldUpdateBounds=${shouldUpdateBounds}`,
							)
						}

						if (shouldUpdateBounds) {
							lastBoundsUpdateRef.current = now

							// Verificar si realmente necesitamos actualizar bounds
							const zoomChanged =
								Math.abs(
									currentZoom - (viewport.zoom || DEFAULT_ZOOM_FALLBACK),
								) > ZOOM_CHANGE_THRESHOLD
							const centerChanged =
								!viewport.center ||
								Math.abs(viewport.center.lat - lat) > 0.001 ||
								Math.abs(viewport.center.lng - lng) > 0.001
							const drasticCenterChange =
								viewport.center &&
								(Math.abs(viewport.center.lat - lat) > 1 ||
									Math.abs(viewport.center.lng - lng) > 1)

							if (__DEV__) {
								console.log(
									`🔍 Step 1 - Update conditions: zoomChanged=${zoomChanged}, centerChanged=${centerChanged}, drasticCenterChange=${drasticCenterChange}`,
								)
								console.log(
									`🔍 Step 1 - Zoom comparison: current=${currentZoom}, stored=${viewport.zoom}, threshold=${ZOOM_CHANGE_THRESHOLD}`,
								)
							}

							// Siempre actualizar bounds en zoom out para mostrar más contenedores
							if (
								zoomChanged ||
								centerChanged ||
								drasticCenterChange ||
								currentZoom < (viewport.zoom || 0)
							) {
								// Usar getVisibleBounds() del MapView para obtener bounds precisos
								const bounds = await mapRef.current.getVisibleBounds()
								if (__DEV__) {
									console.log(`🔍 Step 1 - getVisibleBounds() result:`, bounds)
								}

								if (bounds && Array.isArray(bounds) && bounds.length === 2) {
									// getVisibleBounds() devuelve [[lng, lat], [lng, lat]]
									// Determinar cuál es sw y cuál es ne
									const [point1, point2] = bounds
									const newBounds: LngLatBounds = [
										[
											Math.min(point1[0], point2[0]),
											Math.min(point1[1], point2[1]),
										], // sw: [min_lng, min_lat]
										[
											Math.max(point1[0], point2[0]),
											Math.max(point1[1], point2[1]),
										], // ne: [max_lng, max_lat]
									]

									if (__DEV__) {
										console.log(`🔍 Step 1 - Setting bounds:`, newBounds)
									}
									setBounds(newBounds)
								} else {
									// Fallback si getVisibleBounds() falla
									console.warn(
										`⚠️ getVisibleBounds() returned invalid data, using fallback`,
									)
									const latDelta = 180 / Math.pow(2, currentZoom)
									const lngDelta = 360 / Math.pow(2, currentZoom)
									const newBounds: LngLatBounds = [
										[lng - lngDelta / 2, lat - latDelta / 2], // sw
										[lng + lngDelta / 2, lat + latDelta / 2], // ne
									]
									setBounds(newBounds)
								}
							}
						}
					}
				} catch (error) {
					console.warn(`⚠️ Error getting map state:`, error)
				}
			}
		},
		[setZoom, setBounds, setCenter, viewport.zoom, viewport.center],
	)

	useEffect(() => {
		let isMounted = true
		const run = async () => {
			if (!isUserLocationFABActivated) {
				stopWatching()
				if (userLocationRef.current) {
					await userLocationRef.current.setLocationManager({ running: false })
				}
				return
			}
			const ok = await setPermissions(true)
			if (!ok || !isMounted) return
			if (userLocationRef.current) {
				await userLocationRef.current.setLocationManager({ running: true })
			}
			await startWatching()
			console.log('UserLocation activado')
		}
		run()
		return () => {
			isMounted = false
		}
	}, [isUserLocationFABActivated, setPermissions, startWatching, stopWatching])

	// Las coordenadas ya las gestiona userLocationStore con startWatching

	useEffect(() => {
		if (!viewport.center || !cameraRef.current || !shouldAnimate) {
			return
		}

		console.log(
			'🔍 Animating to center:',
			viewport.center,
			'zoom:',
			viewport.zoom,
		)
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

			// Actualizar bounds al finalizar animación
			if (mapRef.current) {
				try {
					const currentZoom = await mapRef.current.getZoom()
					const currentCenter = await mapRef.current.getCenter()
					if (currentCenter) {
						const [lng, lat] = currentCenter
						setCenter({ lat, lng })
						setZoom(currentZoom)

						// Obtener bounds actualizados
						const bounds = await mapRef.current.getVisibleBounds()
						if (bounds && Array.isArray(bounds) && bounds.length === 2) {
							const [point1, point2] = bounds
							const newBounds: LngLatBounds = [
								[
									Math.min(point1[0], point2[0]),
									Math.min(point1[1], point2[1]),
								], // sw: [min_lng, min_lat]
								[
									Math.max(point1[0], point2[0]),
									Math.max(point1[1], point2[1]),
								], // ne: [max_lng, max_lat]
							]

							if (__DEV__) {
								console.log(`🔍 Post-animation bounds update:`, newBounds)
							}
							setBounds(newBounds)
						}
					}
				} catch (error) {
					console.warn(`⚠️ Error updating bounds after animation:`, error)
				}
			}
		}, ANIMATION_DURATION_MS + 100) // Tiempo de animación + buffer

		return () => clearTimeout(timeout)
	}, [viewport.center, viewport.zoom, shouldAnimate, resetAnimation])

	useEffect(() => {
		// Limpiar cualquier referencia residual al desmontar
		return () => {
			// Cleanup si es necesario
		}
	}, [])

	return (
		<MapView
			ref={mapRef}
			styleURL={Mapbox.StyleURL.Light}
			style={mapStyles.map}
			scaleBarEnabled={false}
			compassEnabled
			compassPosition={COMPASS_POSITION}
			onMapIdle={handleMapIdle}
			onMapLoadingError={handleMapLoadingError}
			onCameraChanged={handleCameraChanged}
			zoomEnabled
			rotateEnabled
		>
			<Camera
				ref={cameraRef}
				defaultSettings={{
					centerCoordinate: INITIAL_CENTER,
					zoomLevel: MapZoomLevels.DISTRICT, // Usar zoom fijo para evitar conflictos
					animationDuration: 1000, // Mantener 1000ms para la animación inicial
					animationMode: 'flyTo',
				}}
				// bounds={{ ne: [40.35, -3.8], sw: [40.5, -3.6] }}
				followUserLocation={isUserLocationFABActivated}
				followZoomLevel={15}
			/>
			{/* Clusters y marcadores de contenedores */}
			<SuperclusterMarkers />
			{isUserLocationFABActivated && (
				<>
					<UserLocation
						ref={userLocationRef}
						showsUserHeadingIndicator
						animated
						androidRenderMode="compass"
						visible
						minDisplacement={0}
					/>
					<LocationPuck
						visible
						puckBearingEnabled
						puckBearing="heading"
						pulsing={{ isEnabled: true }}
					/>
				</>
			)}
		</MapView>
	)
})
MapBase.displayName = 'MapBase'

export default MapBase
