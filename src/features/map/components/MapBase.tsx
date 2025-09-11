import Mapbox, {
	Camera,
	LocationPuck,
	MapView,
	UserLocation,
	type Location,
} from '@rnmapbox/maps'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useMapStore } from '../stores/mapStore'
import { useLocationStore } from '../stores/userLocationStore'
import { mapStyles } from '../styles/mapStyles'

const MapBase = React.memo(() => {
	const mapRef = useRef<MapView | null>(null)
	const cameraRef = useRef<Camera | null>(null)
	// Eliminado lastLocationRef por no utilizarse
	const userLocationRef = useRef<UserLocation | null>(null)

	const { isUserLocationFABActivated } = useMapStore()
	const {
		setPermissions,
		startWatching,
		stopWatching,
		location: expoLocation,
	} = useLocationStore()

	// Memoizar los callbacks para evitar re-renderizados
	const handleMapIdle = useCallback(() => {
		console.log('Mapa cargado correctamente')
	}, [])

	const handleMapLoadingError = useCallback(() => {
		console.error('Error al cargar mapa')
	}, [])

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

	const [location, setLocation] = useState<Location>()

	useEffect(() => {
		if (location) {
			const { coords } = location
			console.log('location coords:', [coords.longitude, coords.latitude])
		}
	}, [location])

	// Fallback: si Mapbox no emite, usa expo-location cuando el FAB esté activo
	useEffect(() => {
		if (!isUserLocationFABActivated || !expoLocation) return
		const { coords } = expoLocation
		setLocation({
			coords: {
				latitude: coords.latitude,
				longitude: coords.longitude,
				altitude: coords.altitude ?? 0,
				accuracy: coords.accuracy ?? 0,
				heading: coords.heading ?? 0,
				speed: coords.speed ?? 0,
			},
			timestamp: expoLocation.timestamp,
		} as unknown as Location)
	}, [isUserLocationFABActivated, expoLocation])

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
			zoomEnabled
			rotateEnabled
		>
			<Camera
				ref={cameraRef}
				defaultSettings={{
					centerCoordinate: [-3.7038, 40.4168],
					zoomLevel: 11,
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
		</MapView>
	)
})
MapBase.displayName = 'MapBase'

export default MapBase
