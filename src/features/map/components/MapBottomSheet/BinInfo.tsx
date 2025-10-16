import { fitBoundsToTwoPoints } from '@map/services/mapService'
import { useMapCameraStore } from '@map/stores/mapCameraStore'
import { useMapNavigationStore } from '@map/stores/mapNavigationStore'
import { useUserLocationFABStore } from '@map/stores/userLocationFABStore'
import { useUserLocationStore } from '@map/stores/userLocationStore'
import type { BinPoint, LngLat } from '@map/types/mapData'
import { RouteProfile } from '@map/types/navigation'
import { Pressable, Text, View } from 'react-native'

interface BinInfoProps {
	bin: BinPoint
	onNavigate?: (bin: BinPoint) => void
}

const BinInfo: React.FC<BinInfoProps> = ({ bin, onNavigate }) => {
	const {
		properties: { direccion, distrito, barrio, binType },
		geometry: { coordinates },
	} = bin

	const [longitude, latitude] = coordinates

	const {
		isUserLocationFABActivated,
		setIsUserLocationFABActivated,
		setIsManuallyActivated,
	} = useUserLocationFABStore()
	const {
		location: userLocation,
		requestPermissions,
		getCurrentLocation,
	} = useUserLocationStore()
	const { calculateRoute, setNavigationMode } = useMapNavigationStore()
	const { cameraRef } = useMapCameraStore()

	const handleNavigate = async () => {
		let currentUserLocation = userLocation

		if (!isUserLocationFABActivated) {
			await requestPermissions()
			setIsUserLocationFABActivated(true)
			// NO activar isManuallyActivated porque es activación automática
			setIsManuallyActivated(false)
			currentUserLocation = await getCurrentLocation()
		}

		if (!currentUserLocation) {
			console.warn('⚠️ Ubicación del usuario no disponible')
			return
		}

		const userCoords: LngLat = [
			currentUserLocation.longitude,
			currentUserLocation.latitude,
		]

		if (!cameraRef) {
			console.warn('⚠️ Cámara no disponible')
			return
		}

		setNavigationMode(true)

		await new Promise(resolve => setTimeout(resolve, 100))

		fitBoundsToTwoPoints(cameraRef, userCoords, coordinates)

		const route = await calculateRoute(
			userCoords,
			coordinates,
			RouteProfile.WALKING,
		)

		if (!route) {
			console.warn('❌ No se pudo calcular la ruta')
		}
	}

	return (
		<View className="w-full px-8 py-6">
			<Text className="font-lato-mediumsemibold text-sm uppercase text-gray-500">
				Contenedor seleccionado
			</Text>
			<Text className="mt-2 font-lato-bold text-2xl text-gray-900">
				{direccion}
			</Text>
			<Text className="mt-1 font-lato-medium text-base text-gray-700">
				{distrito} · {barrio}
			</Text>
			<Text className="mt-1 font-lato-medium text-sm text-gray-500">
				Tipo: {binType}
			</Text>

			<View className="mt-4 flex-row justify-between">
				<Text className="font-lato-medium text-xs uppercase text-gray-500">
					Coordenadas
				</Text>
				<Text className="font-lato-medium text-xs text-gray-700">
					{latitude.toFixed(5)} / {longitude.toFixed(5)}
				</Text>
			</View>

			<Pressable
				className="mt-6 flex-row items-center justify-center rounded-full bg-secondary px-4 py-3"
				onPress={handleNavigate}
			>
				<Text className="ml-2 font-lato-semibold text-base text-white">
					Cómo llegar
				</Text>
			</Pressable>
		</View>
	)
}

export default BinInfo
