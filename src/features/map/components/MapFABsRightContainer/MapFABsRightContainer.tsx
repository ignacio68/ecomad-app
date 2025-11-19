import FAB from '@/shared/components/ui/buttons/FAB'
import FABExpanded from '@/shared/components/ui/buttons/FABExpanded'
import {
	Layers01Icon as Layers01IconDuotone,
	UserRoadsideIcon,
	GpsOff02Icon,
	Gps02Icon,
} from '@hugeicons-pro/core-duotone-rounded'
import { Layers01Icon } from '@hugeicons-pro/core-stroke-rounded'
import { MAP_FAB_STYLES } from '@map/constants/map'
import { useMapStyleStore } from '@map/stores/mapStyleStore'
import { useUserLocationFABStore } from '@map/stores/userLocationFABStore'
import { useUserLocationStore } from '@map/stores/userLocationStore'
import { StyleURL } from '@rnmapbox/maps'
import { PermissionStatus } from 'expo-location'
import { View } from 'react-native'

const MapFABsRightContainer = () => {
	const {
		isUserLocationFABActivated,
		isMapStylesFABActivated,
		setIsMapStylesFABActivated,
		activateUserLocation,
		deactivateUserLocation,
	} = useUserLocationFABStore()
	const {
		requestPermissions,
		startTracking,
		stopTracking,
		getCurrentLocation,
	} = useUserLocationStore()
	const { setMapStyle } = useMapStyleStore()

	const handleUserLocation = async () => {

		if (!isUserLocationFABActivated) {
			// 1️⃣ Activar localización
			const permissionStatus = await requestPermissions()
			if (permissionStatus !== PermissionStatus.GRANTED) {
				console.warn('⚠️ Permisos de ubicación no concedidos')
				// TODO: Mostrar modal con opciones para el usuario
				return
			}

			await getCurrentLocation()
			await startTracking()
			activateUserLocation({ manual: true }) // <-- marca que fue activado desde el FAB
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
				iconSelected={UserRoadsideIcon}
				colorSelected='#0074d9'
				isSelected={isUserLocationFABActivated}
				onPress={handleUserLocation}
			/>
		</View>
	)
}

export default MapFABsRightContainer
