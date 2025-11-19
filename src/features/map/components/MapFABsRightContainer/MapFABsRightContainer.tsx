import FAB from '@/shared/components/ui/buttons/FAB'
import FABExpanded from '@/shared/components/ui/buttons/FABExpanded'
import {
	Gps02Icon,
	Layers01Icon as Layers01IconDuotone,
	UserRoadsideIcon,
} from '@hugeicons-pro/core-duotone-rounded'
import { Gps02Icon as Gps02IconSolid } from '@hugeicons-pro/core-solid-rounded'
import { Layers01Icon } from '@hugeicons-pro/core-stroke-rounded'
import { MAP_FAB_STYLES } from '@map/constants/map'
import { userLocationService } from '@map/services/userLocationService'
import { useMapStyleStore } from '@map/stores/mapStyleStore'
import { useMapViewportStore } from '@map/stores/mapViewportStore'
import { useUserLocationFABStore } from '@map/stores/userLocationFABStore'
import { useUserLocationStore } from '@map/stores/userLocationStore'
import { MapZoomLevels } from '@map/types/mapData'
import { StyleURL } from '@rnmapbox/maps'
import { PermissionStatus } from 'expo-location'
import { View } from 'react-native'

const MapFABsRightContainer = () => {
	const {
		isUserLocationFABActivated,
		isUserLocationCentered,
		isMapStylesFABActivated,
		setIsMapStylesFABActivated,
		activateUserLocation,
		deactivateUserLocation,
		setIsUserLocationCentered,
	} = useUserLocationFABStore()
	const {
		isLoading,
		requestPermissions,
		startTracking,
		stopTracking,
		getCurrentLocation,
	} = useUserLocationStore()
	const { setMapStyle } = useMapStyleStore()
	const setViewportAnimated = useMapViewportStore(
		state => state.setViewportAnimated,
	)

	const centerOnLastKnownLocation = () => {
		const storeLocation = useUserLocationStore.getState().location
		const cachedLocation =
			storeLocation || userLocationService.getLastKnownLocation()
		if (!cachedLocation) {
			return
		}

		// Garantizar que el store tenga esa ubicación aunque venga del servicio
		if (!storeLocation) {
			useUserLocationStore.setState({ location: cachedLocation })
		}

		const nextCenter = {
			lat: cachedLocation.latitude,
			lng: cachedLocation.longitude,
		}

		setViewportAnimated({
			center: nextCenter,
			zoom: MapZoomLevels.BINS,
		})

		setIsUserLocationCentered(true)
	}

	const handleUserLocation = async () => {
		if (!isUserLocationFABActivated) {
			// 1️⃣ Activar localización
			const permissionStatus = await requestPermissions()
			if (permissionStatus !== PermissionStatus.GRANTED) {
				console.warn('⚠️ Permisos de ubicación no concedidos')
				// TODO: Mostrar modal con opciones para el usuario
				return
			}

			activateUserLocation({ manual: true }) // toggle de inmediato
			centerOnLastKnownLocation()

			const shouldFetchInstantLocation =
				!useUserLocationStore.getState().location

			const currentLocationPromise = shouldFetchInstantLocation
				? getCurrentLocation().catch(err => {
						console.warn('⚠️ [FAB] Failed to get current location', err)
						return null
					})
				: Promise.resolve(useUserLocationStore.getState().location)

			const startTrackingPromise = startTracking().catch(err => {
				console.warn('⚠️ [FAB] Failed to start tracking', err)
				return false
			})

			await Promise.all([currentLocationPromise, startTrackingPromise])
		} else if (!isUserLocationCentered) {
			centerOnLastKnownLocation()
		} else {
			// 2️⃣ Desactivar localización
			await stopTracking()
			deactivateUserLocation()
		}
	}

	const handleToggleMapStyles = () => {
		setIsMapStylesFABActivated(!isMapStylesFABActivated)
	}

	const handleSelectMapStyle = (mapStyle: StyleURL) => {
		setMapStyle(mapStyle)
		setIsMapStylesFABActivated(!isMapStylesFABActivated)
	}

	const getUserLocationActivatedIcon = () => {
		if (!isUserLocationFABActivated) {
			return Gps02IconSolid
		}
		return isUserLocationCentered ? Gps02Icon : Gps02IconSolid
	}

	return (
		<View className="flex-column absolute right-4 top-52 w-14  flex-1 items-start justify-center gap-4">
			<FABExpanded
				name="mapStyles"
				icon={Layers01Icon}
				iconSelected={Layers01IconDuotone}
				colorSelected="#0074d9"
				isSelected={isMapStylesFABActivated}
				onPress={handleToggleMapStyles}
				fabChildren={MAP_FAB_STYLES.map(style => ({
					name: style.name,
					childrenAsset: { source: style.image },
					onPress: () => handleSelectMapStyle(style.styleURL),
				}))}
			/>
			<FAB
				name="userLocation"
				icon={UserRoadsideIcon}
				iconSelected={getUserLocationActivatedIcon()}
				colorSelected="#0074d9"
				isSelected={isUserLocationFABActivated}
				loading={isLoading}
				onPress={handleUserLocation}
			/>
		</View>
	)
}

export default MapFABsRightContainer
