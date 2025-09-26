import { Bounds } from '@/shared/types/search'
import Mapbox, {
	Camera,
	LocationPuck,
	MapView,
	UserLocation,
} from '@rnmapbox/maps'
import React, { useCallback, useEffect, useRef } from 'react'
import { useMapDataByZoom } from '../hooks/useMapDataByZoom'
import { useMapStore } from '../stores/mapStore'
import { useMapViewportStore } from '../stores/mapViewportStore'
import { useLocationStore } from '../stores/userLocationStore'
import { mapStyles } from '../styles/mapStyles'
import MapMarkers from './MapMarkers'

const MapBase = React.memo(() => {
	const mapRef = useRef<MapView | null>(null)
	const cameraRef = useRef<Camera | null>(null)
	// Eliminado lastLocationRef por no utilizarse
	const userLocationRef = useRef<UserLocation | null>(null)

	const { isUserLocationFABActivated } = useMapStore()
	const { setPermissions, startWatching, stopWatching } = useLocationStore()
	const { setZoom, setBounds, setCenter, viewport } = useMapViewportStore()

	// Hook para manejar datos del mapa según zoom
	const { mapData } = useMapDataByZoom()

	// Debug temporal para mapData del store (comentado)
	// console.log(`🗺️ MAPBASE: mapData from store - type=${mapData.type}, items=${mapData.data.length}`)

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

		// Solo establecer bounds y centro inicial si no existen
		if (!viewport.bounds) {
			const initialBounds: Bounds = {
				minLat: 40.35,
				maxLat: 40.5,
				minLng: -3.8,
				maxLng: -3.6,
			}
			console.log('📍 Setting initial bounds (first time only):', initialBounds)
			setBounds(initialBounds)
		}

		if (!viewport.center) {
			const initialCenter = { lat: 40.4168, lng: -3.7038 } // Centro de Madrid
			console.log('📍 Setting initial center (first time only):', initialCenter)
			setCenter(initialCenter)
		}
	}, [setBounds, setCenter, viewport.bounds, viewport.center])

	const handleMapLoadingError = useCallback(() => {
		console.error('Error al cargar mapa')
	}, [])

	// Ref para throttling de eventos de cámara (solo para bounds)
	const lastBoundsUpdateRef = useRef<number>(0)
	const BOUNDS_THROTTLE_MS = 100 // Actualizar bounds máximo cada 100ms

	const handleCameraChanged = useCallback(
		(state: any) => {
			// Actualizar zoom y centro inmediatamente (sin throttling)
			if (state?.properties?.zoom) {
				setZoom(state.properties.zoom)
			}

			// Actualizar centro inmediatamente cuando la cámara cambia
			if (state.properties.center) {
				const [lng, lat] = state.properties.center
				const zoom = state.properties.zoom ?? 10

				// Guardar el centro del mapa inmediatamente
				setCenter({ lat, lng })
				console.log(`📍 MapBase: Updating center to ${lat}, ${lng}`)

				// Throttling solo para bounds (cálculos más pesados)
				const now = Date.now()
				const shouldUpdateBounds =
					now - lastBoundsUpdateRef.current > BOUNDS_THROTTLE_MS

				if (shouldUpdateBounds) {
					lastBoundsUpdateRef.current = now

					// Solo calcular bounds si el zoom cambió significativamente
					const zoomChanged = Math.abs(zoom - (viewport.zoom || 10)) > 0.5
					if (zoomChanged) {
						const latDelta = 180 / Math.pow(2, zoom)
						const lngDelta = 360 / Math.pow(2, zoom)

						const newBounds: Bounds = {
							minLat: lat - latDelta / 2,
							maxLat: lat + latDelta / 2,
							minLng: lng - lngDelta / 2,
							maxLng: lng + lngDelta / 2,
						}

						// Validar que los bounds sean válidos
						if (
							newBounds.minLat < newBounds.maxLat &&
							newBounds.minLng < newBounds.maxLng
						) {
							setBounds(newBounds)
						}
					}
				}
			}
		},
		[setZoom, setBounds, setCenter, viewport.zoom],
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
			compassPosition={{ top: 240, right: 14 }}
			onMapIdle={handleMapIdle}
			onMapLoadingError={handleMapLoadingError}
			onCameraChanged={handleCameraChanged}
			zoomEnabled
			rotateEnabled
		>
			<Camera
				ref={cameraRef}
				defaultSettings={{
					centerCoordinate: [-3.7038, 40.4168],
					zoomLevel: 10,
					animationDuration: 1000,
					animationMode: 'flyTo',
				}}
				// bounds={{ ne: [40.35, -3.8], sw: [40.5, -3.6] }}
				followUserLocation={isUserLocationFABActivated}
				followZoomLevel={15}
			/>
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
			{/* Markers de contenedores */}
			<MapMarkers />
		</MapView>
	)
})
MapBase.displayName = 'MapBase'

export default MapBase
