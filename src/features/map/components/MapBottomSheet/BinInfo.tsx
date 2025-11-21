import {
	getDistrictNameByCode,
	getNeighborhoodNameByCode,
} from '@/shared/utils/locationsUtils'
import { Cancel01Icon } from '@hugeicons-pro/core-duotone-rounded'
import { SquareArrowDownRightIcon } from '@hugeicons-pro/core-solid-rounded'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { fitBoundsToTwoPoints } from '@map/services/mapService'
import { useMapBottomSheetStore } from '@map/stores/mapBottomSheetStore'
import { useMapCameraStore } from '@map/stores/mapCameraStore'
import { useMapNavigationStore } from '@map/stores/mapNavigationStore'
import { useMapViewportStore } from '@map/stores/mapViewportStore'
import { useNavigationBottomSheetStore } from '@map/stores/navigationBottomSheetStore'
import { useUserLocationFABStore } from '@map/stores/userLocationFABStore'
import { useUserLocationStore } from '@map/stores/userLocationStore'
import type { BinPoint, LngLat } from '@map/types/mapData'
import { MapZoomLevels, MarkerType } from '@map/types/mapData'
import { RouteProfile } from '@map/types/navigation'
import type { UserLocation } from '@map/types/userLocation'
import { PermissionStatus } from 'expo-location'
import { useCallback, useEffect, useRef } from 'react'
import { Pressable, Text, View } from 'react-native'
// TODO: validar distancia (origen → destino) antes de llamar a Directions API.
// Si supera el límite de Mapbox, mostrar modal/toast en vez de lanzar la petición.
interface BinInfoProps {
	bin: BinPoint
	onNavigate?: (bin: BinPoint) => void
	onClose?: () => void
}

const BinInfo = ({ bin, onNavigate, onClose }: BinInfoProps) => {
	const { setViewportAnimated } = useMapViewportStore()
	const { deactivateRouteIfActive } = useMapNavigationStore()
	const { setMarkerType, reset } = useMapBottomSheetStore()
	const { setIsNavigationBottomSheetOpen } = useNavigationBottomSheetStore()
	const {
		properties: { address, district_code, neighborhood_code, notes, subtype },
		geometry: { coordinates },
	} = bin

	const [longitude, latitude] = coordinates

	// Convertir códigos a nombres usando las funciones helper
	const districtName = getDistrictNameByCode(district_code)
	const neighborhoodName = neighborhood_code
		? getNeighborhoodNameByCode(neighborhood_code)
		: null
	const {
		isUserLocationFABActivated,
		setIsUserLocationFABActivated,
		setIsManuallyActivated,
	} = useUserLocationFABStore()
	const { requestPermissions, getCurrentLocation, startTracking } =
		useUserLocationStore()
	const { calculateRoute, setNavigationMode, hasActiveRoute, clearRoute } =
		useMapNavigationStore()
	const { cameraRef } = useMapCameraStore()

	const binIdRef = useRef<string | number | null>(null)

	// Limpiar ruta cuando cambia el bin seleccionado
	useEffect(() => {
		const currentBinId = bin.properties.containerId
		if (binIdRef.current !== null && binIdRef.current !== currentBinId) {
			if (hasActiveRoute) {
				clearRoute()
				setNavigationMode(false)
			}
		}
		binIdRef.current = currentBinId
	}, [
		bin.properties.containerId,
		hasActiveRoute,
		clearRoute,
		setNavigationMode,
	])

	const handleNavigate = async () => {
		// setIsNavigationBottomSheetOpen(true)
		if (!cameraRef || hasActiveRoute) {
			handleCloseNavigate()
			return
		}

		let currentUserLocation: UserLocation | null = null

		if (isUserLocationFABActivated) {
			// Si el FAB ya está activado, leer directamente del store (más rápido)
			currentUserLocation = useUserLocationStore.getState().location
		} else {
			// Si el FAB no está activado, activarlo primero
			const permissionStatus = await requestPermissions()
			if (permissionStatus !== PermissionStatus.GRANTED) {
				console.warn('⚠️ Permisos de ubicación denegados')
				return
			}
			setIsUserLocationFABActivated(true)
			setIsManuallyActivated(false)
			await startTracking().catch(error => {
				console.warn('⚠️ No se pudo iniciar el tracking de ubicación', error)
				return false
			})

			// Intentar usar la ubicación del store primero (puede estar disponible aunque el FAB no esté activado)
			currentUserLocation = useUserLocationStore.getState().location

			// Solo llamar a getCurrentLocation() si realmente no hay ubicación disponible
			if (!currentUserLocation) {
				currentUserLocation = await getCurrentLocation()
			}
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

	const handleCloseBin = () => {
		handleCloseNavigate()
		setMarkerType(MarkerType.GENERAL)
		reset()
	}

	const handleCloseNavigate = () => {
		clearRoute()
		setNavigationMode(false)
		setViewportAnimated({
			zoom: MapZoomLevels.BINS,
			center: { lng: longitude, lat: latitude },
		})
	}

	const getNavigationButtonColor = useCallback(() => {
		if (hasActiveRoute) {
			return 'bg-secondary/80'
		}
		return 'bg-secondary'
	}, [hasActiveRoute])

	return (
		<>
			<View className="flex-row items-center justify-between">
				<Text className="font-lato-semibold text-sm uppercase text-gray-500">
					Contenedor seleccionado
				</Text>
				<Pressable className="rounded-full bg-secondary/10 p-2" onPress={handleCloseBin}>
					<HugeiconsIcon
						icon={Cancel01Icon}
						size={24}
						strokeWidth={2}
						color="gray"
						accessibilityLabel={`cierra el bottom sheet deinformación del contenedor`}
						testID={`CloseBottomSheetIcon`}

					/>
				</Pressable>
			</View>
			<Text className="mt-1 font-lato-bold text-2xl text-gray-900">
				{address}
			</Text>
			<View className="flex-row items-center gap-2">
				<Text className="font-lato-medium text-base text-gray-700">
					{districtName}
				</Text>
				{!!neighborhoodName && (
					<Text className="font-lato-medium text-base text-gray-700">
						· {neighborhoodName}
					</Text>
				)}
			</View>
			{subtype && (
				<Text className="mt-2 font-lato-medium text-sm text-gray-600">
					Tipo de contenedor: {subtype}
				</Text>
			)}
			{notes && (
				<Text className="mt-4 font-lato-regular text-sm text-gray-500">
					ℹ️ {notes}
				</Text>
			)}

			<View className="mt-2 flex-row justify-start gap-2">
				<Text className="font-lato-medium text-xs uppercase text-gray-500">
					Coordenadas:
				</Text>
				<Text className="font-lato-semibold text-xs text-gray-700">
					{latitude.toFixed(5)} / {longitude.toFixed(5)}
				</Text>
			</View>
			<Pressable
				className={`self-center rounded-full ${getNavigationButtonColor()} mb-5 mt-6 flex-row items-center justify-center gap-3 px-5 py-3`}
				accessibilityLabel={'botón de navegación'}
				testID={`NavigateButton`}
				onPress={handleNavigate}
			>
				<HugeiconsIcon
					icon={SquareArrowDownRightIcon}
					altIcon={Cancel01Icon}
					showAlt={hasActiveRoute}
					size={24}
					color="white"
					accessibilityLabel={`comienza la navegación`}
					testID={`StartNAvigationIcon`}
				/>
				<Text className=" text-center font-lato-semibold text-xl leading-5 text-white">
					Cómo llegar
				</Text>
			</Pressable>
		</>
	)
}

export default BinInfo
