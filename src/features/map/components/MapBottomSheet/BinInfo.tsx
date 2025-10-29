import { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Cancel01Icon } from '@hugeicons-pro/core-duotone-rounded'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { fitBoundsToTwoPoints } from '@map/services/mapService'
import { useMapCameraStore } from '@map/stores/mapCameraStore'
import { useMapNavigationStore } from '@map/stores/mapNavigationStore'
import { useMapViewportStore } from '@map/stores/mapViewportStore'
import { useUserLocationFABStore } from '@map/stores/userLocationFABStore'
import { useUserLocationStore } from '@map/stores/userLocationStore'
import type { BinPoint, LngLat } from '@map/types/mapData'
import { MapZoomLevels } from '@map/types/mapData'
import { RouteProfile } from '@map/types/navigation'
import { Pressable, Text, View } from 'react-native'

interface BinInfoProps {
	bin: BinPoint
	onNavigate?: (bin: BinPoint) => void
}

const BinInfo  = ({ bin, onNavigate }: BinInfoProps) => {
	const { setViewportAnimated } = useMapViewportStore()

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
	const { calculateRoute, setNavigationMode, hasActiveRoute, clearRoute } =
		useMapNavigationStore()
	const { cameraRef } = useMapCameraStore()

	const handleNavigate = async () => {
		if (!cameraRef || hasActiveRoute) {
			return
		}

		let currentUserLocation = userLocation

		if (!isUserLocationFABActivated) {
			await requestPermissions()
			setIsUserLocationFABActivated(true)
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

		setNavigationMode(true)

		const route = await calculateRoute(
			userCoords,
			coordinates,
			RouteProfile.WALKING,
		)

		if (!route) {
			console.warn('❌ No se pudo calcular la ruta')
			return
		}

		await new Promise(resolve => setTimeout(resolve, 100))
		fitBoundsToTwoPoints(cameraRef, userCoords, coordinates)
	}

	const handleClose = () => {
		clearRoute()
		setNavigationMode(false)
		setViewportAnimated({
			zoom: MapZoomLevels.CONTAINER,
			center: { lng: longitude, lat: latitude },
		})
	}

	const getNavigationButtonColor = () => {
		if (hasActiveRoute) {
			return 'bg-gray-500'
		}
		return 'bg-secondary'
	}

	return (
		<BottomSheetScrollView className="w-full px-2 py-6">
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
			<View className="mb-6 mt-4 flex-1 flex-row items-center justify-between gap-8">
				<Pressable
					className={`rounded-full ${getNavigationButtonColor()} w-40 px-4 py-3`}
					onPress={handleNavigate}
					accessibilityLabel={'botón de navegación'}
				>
					<Text className="ml-2 text-center font-lato-semibold text-base text-white">
						Cómo llegar
					</Text>
				</Pressable>
				{hasActiveRoute && (
					<Pressable
						onPress={handleClose}
						className="rounded-full bg-secondary/20 p-2"
					>
						<HugeiconsIcon
							icon={Cancel01Icon}
							size={16}
							color="black"
							strokeWidth={2}
							accessibilityLabel={`Cierra el bottom sheet de navegación`}
							testID={`CloseBottomSheet`}
						/>
					</Pressable>
				)}
			</View>
		</BottomSheetScrollView>
	)
}

export default BinInfo
