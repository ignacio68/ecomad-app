import Mapbox, {
	Camera,
	LocationPuck,
	MapView,
	UserLocation,
} from '@rnmapbox/maps'
import React, { useCallback, useEffect, useRef } from 'react'
import {
	ANIMATION_DURATION_MS,
	ANIMATION_TIMEOUT_MS,
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
	const lastFocusedRef = useRef<{
		center: { lat: number; lng: number }
		zoom: number
	} | null>(null)

	const { isUserLocationFABActivated } = useMapStore()
	const { setPermissions, startWatching, stopWatching } = useLocationStore()
	const {
		setZoom,
		setBounds,
		setCenter,
		viewport,
		shouldAnimate,
		resetAnimation,
		updateBoundsFromMap,
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
	const BOUNDS_THROTTLE_MS = 100 // Actualizar bounds máximo cada 100ms

	const handleCameraChanged = useCallback(
		(state: any) => {
			if (isAnimatingRef.current) {
				return
			}

			// Actualizar zoom y centro inmediatamente (sin throttling)
			if (state?.properties?.zoom) {
				if (__DEV__) {
					console.log(`🔍 Camera changed - zoom: ${state.properties.zoom}`)
				}
				setZoom(state.properties.zoom)
			}

			// Actualizar centro inmediatamente cuando la cámara cambia
			if (state.properties.center) {
				const [lng, lat] = state.properties.center
				const zoom = state.properties.zoom ?? DEFAULT_ZOOM_FALLBACK

				// Guardar el centro del mapa inmediatamente
				setCenter({ lat, lng })
				// console.log(`📍 MapBase: Updating center to ${lat}, ${lng}`)

				// Throttling solo para bounds (cálculos más pesados)
				const now = Date.now()
				const shouldUpdateBounds =
					now - lastBoundsUpdateRef.current > BOUNDS_THROTTLE_MS

				if (shouldUpdateBounds) {
					lastBoundsUpdateRef.current = now

					// Usar getVisibleBounds() del MapView para obtener bounds precisos
					const zoomChanged =
						Math.abs(zoom - (viewport.zoom || DEFAULT_ZOOM_FALLBACK)) >
						ZOOM_CHANGE_THRESHOLD
					const centerChanged =
						!viewport.center ||
						Math.abs(viewport.center.lat - lat) > 0.001 ||
						Math.abs(viewport.center.lng - lng) > 0.001

					// Forzar actualización si hay cambio drástico de centro (más de 1 grado)
					const drasticCenterChange =
						viewport.center &&
						(Math.abs(viewport.center.lat - lat) > 1 ||
							Math.abs(viewport.center.lng - lng) > 1)

					if (zoomChanged || centerChanged || drasticCenterChange) {
						// Usar fallback: calcular bounds basados en el centro y zoom
						// getVisibleBounds() está devolviendo bounds incorrectos
						const latDelta = 180 / Math.pow(2, zoom)
						const lngDelta = 360 / Math.pow(2, zoom)

						const newBounds: LngLatBounds = [
							[lng - lngDelta / 2, lat - latDelta / 2], // sw
							[lng + lngDelta / 2, lat + latDelta / 2], // ne
						]

						if (__DEV__) {
							console.log(`🔍 MapBase: Calculated bounds (fallback):`, {
								center: { lat, lng },
								zoom,
								latDelta,
								lngDelta,
								bounds: newBounds,
							})
						}

						// Validar que los bounds sean válidos
						const [sw, ne] = newBounds
						if (
							sw[1] < ne[1] && // lat
							sw[0] < ne[0] // lng
						) {
							setBounds(newBounds)
						}
					}
				}
			}
		},
		[setZoom, setBounds, setCenter, viewport.zoom, updateBoundsFromMap],
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
		const timeout = setTimeout(() => {
			isAnimatingRef.current = false
			resetAnimation()
		}, ANIMATION_TIMEOUT_MS)
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
