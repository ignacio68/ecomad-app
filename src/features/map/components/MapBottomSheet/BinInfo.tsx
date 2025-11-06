import {
	getDistrictNameById,
	getNeighborhoodNameByCode,
} from '@/shared/utils/locationsUtils'
import { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Cancel01Icon } from '@hugeicons-pro/core-duotone-rounded'
import { SquareArrowUpLeftIcon } from '@hugeicons-pro/core-solid-rounded'
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
import { useCallback } from 'react'
import { Pressable, Text, View } from 'react-native'

interface BinInfoProps {
	bin: BinPoint
	onNavigate?: (bin: BinPoint) => void
}

const BinInfo = ({ bin, onNavigate }: BinInfoProps) => {
	const { setViewportAnimated } = useMapViewportStore()

	const {
		properties: {
			address,
			district_id,
			neighborhood_id,
			binType,
			notes,
			subtype,
		},
		geometry: { coordinates },
	} = bin

	const [longitude, latitude] = coordinates

	// Convertir IDs a nombres usando las funciones helper
	const districtName = getDistrictNameById(district_id)
	const neighborhoodName = neighborhood_id
		? getNeighborhoodNameByCode(neighborhood_id)
		: 'N/A'

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
		if (hasActiveRoute) {
			clearRoute()
			setNavigationMode(false)
			setViewportAnimated({
				zoom: MapZoomLevels.CONTAINER,
				center: { lng: longitude, lat: latitude },
			})
		}
	}

	const getNavigationButtonColor = useCallback(() => {
		if (hasActiveRoute) {
			return 'bg-secondary/80'
		}
		return 'bg-secondary'
	}, [hasActiveRoute])

	const getNavigationIconRotation = useCallback(() => {
		return hasActiveRoute ? 0 : 135
	}, [hasActiveRoute])

	return (
		<BottomSheetScrollView className="w-full px-2 py-6">
			<Text className="font-lato-semibold text-sm uppercase text-gray-500">
				Contenedor seleccionado
			</Text>
			<Text className="mt-2 font-lato-bold text-2xl text-gray-900">
				{address}
			</Text>
			<Text className="mt-1 font-lato-medium text-base text-gray-700">
				{districtName} · {neighborhoodName}
			</Text>
			{subtype && (
				<Text className="mt-1 font-lato-medium text-sm text-gray-600">
					{subtype}
				</Text>
			)}
			{notes && (
				<Text className="mt-2 font-lato-regular text-sm text-gray-500">
					ℹ️ {notes}
				</Text>
			)}

			<View className="mt-4 flex-row justify-between">
				<Text className="font-lato-medium text-xs uppercase text-gray-500">
					Coordenadas
				</Text>
				<Text className="font-lato-medium text-xs text-gray-700">
					{latitude.toFixed(5)} / {longitude.toFixed(5)}
				</Text>
			</View>
			<View
				className={`self-center rounded-full ${getNavigationButtonColor()} mb-5 mt-4 flex-row items-center justify-center gap-3 px-5 py-3`}
				accessibilityLabel={'botón de navegación'}
				testID={`NavigateButton`}
			>
				<HugeiconsIcon
					transform={getNavigationIconRotation}
					icon={SquareArrowUpLeftIcon}
					altIcon={Cancel01Icon}
					showAlt={hasActiveRoute}
					size={24}
					color="white"
					accessibilityLabel={`comienza la navegación`}
					testID={`StartNAvigationIcon`}
					onPress={handleClose}
				/>
				<Pressable onPress={handleNavigate}>
					<Text className=" text-center font-lato-semibold text-xl leading-5 text-white">
						Cómo llegar
					</Text>
				</Pressable>
			</View>
		</BottomSheetScrollView>
	)
}

export default BinInfo
