import Mapbox, {
	Camera,
	LocationPuck,
	MapView,
	UserLocation,
} from '@rnmapbox/maps'
import React, { useCallback, useEffect, useRef } from 'react'
import { useMapDataStore } from '../stores/mapDataStore'
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
	const { setZoom, setBounds } = useMapViewportStore()
	const { mapData } = useMapDataStore()

	// Memoizar los callbacks para evitar re-renderizados
	const handleMapIdle = useCallback(() => {
		console.log('🗺️ Mapa cargado correctamente')
		// Establecer bounds iniciales para Madrid
		const initialBounds = {
			minLat: 40.35,
			maxLat: 40.5,
			minLng: -3.8,
			maxLng: -3.6,
		}
		console.log('📍 Setting initial bounds:', initialBounds)
		setBounds(initialBounds)
	}, [setBounds])

	const handleMapLoadingError = useCallback(() => {
		console.error('Error al cargar mapa')
	}, [])

	const handleCameraChanged = useCallback(
		(state: any) => {
			if (state.properties && state.properties.zoomLevel) {
				setZoom(state.properties.zoomLevel)
			}

			// Calcular bounds cuando la cámara cambia
			if (state.properties.center) {
				const [lng, lat] = state.properties.center
				const zoom = state.properties.zoomLevel ?? 10

				const latDelta = 180 / Math.pow(2, zoom)
				const lngDelta = 360 / Math.pow(2, zoom)

				const newBounds = {
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
		},
		[setZoom, setBounds],
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
			<MapMarkers mapData={mapData} />
		</MapView>
	)
})
MapBase.displayName = 'MapBase'

export default MapBase
