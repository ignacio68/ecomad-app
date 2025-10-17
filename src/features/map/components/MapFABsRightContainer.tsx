import FAB from '@/shared/components/ui/buttons/FAB'
import FABExpanded from '@/shared/components/ui/buttons/FABExpanded'
import {
	Layers01Icon as Layers01IconDuotone,
	LocationUser03Icon,
} from '@hugeicons-pro/core-duotone-rounded'
import { Layers01Icon } from '@hugeicons-pro/core-stroke-rounded'
import { MAP_FAB_STYLES } from '@map/constants/map'
import { useMapStyleStore } from '@map/stores/mapStyleStore'
import { useUserLocationFABStore } from '@map/stores/userLocationFABStore'
import { useUserLocationStore } from '@map/stores/userLocationStore'
import { PermissionStatus } from 'expo-location'
import { memo, useState } from 'react'
import { View } from 'react-native'

const MapFABsRightContainer = memo(() => {
	const { isUserLocationFABActivated, toggleUserLocationFAB } =
		useUserLocationFABStore()
	const [isMapStylesFABActivated, setIsMapStylesFABActivated] = useState(false)
	const { requestPermissions } = useUserLocationStore()
	const { setMapStyle } = useMapStyleStore()

	const userLocationFABActivated = async () => {
		if (!isUserLocationFABActivated) {
			const permissionStatus = await requestPermissions()

			if (permissionStatus !== PermissionStatus.GRANTED) {
				console.warn('⚠️ Permisos de ubicación no concedidos')
				// TODO: Mostrar modal con opciones:
				// - Si DENIED: Botón "Ir a Ajustes" para abrir configuración de la app
				// - Si UNDETERMINED: Botón "Reintentar" para volver a solicitar
				// - Botón "Cancelar" para cerrar el modal
				return
			}

			toggleUserLocationFAB()
		} else {
			toggleUserLocationFAB()
		}
	}

	const mapStylesFABActivated = () => {
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
				onPress={mapStylesFABActivated}
				fabChildren={MAP_FAB_STYLES.map(style => ({
					name: style.name,
					childrenAsset: { source: style.image },
					onPress: () => {
						setMapStyle(style.styleURL)
					},
				}))}
			/>
			<FAB
				name="userLocation"
				icon={LocationUser03Icon}
				iconSelected={LocationUser03Icon}
				colorSelected="red"
				isSelected={isUserLocationFABActivated}
				onPress={userLocationFABActivated}
			/>
		</View>
	)
})

export default MapFABsRightContainer
