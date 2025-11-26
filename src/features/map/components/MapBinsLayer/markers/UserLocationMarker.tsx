import { useMapViewportStore } from '@map/stores/mapViewportStore'
import { useUserLocationStore } from '@map/stores/userLocationStore'
import { MapZoomLevels } from '@map/types/mapData'
import { UserLocation } from '@rnmapbox/maps'

const UserLocationMarker = () => {
	const { location } = useUserLocationStore()
	const { setViewportAnimated } = useMapViewportStore()

	const handlePress = () => {
		if (!location) return
		setViewportAnimated({
			center: { lng: location.longitude, lat: location.latitude },
			zoom: MapZoomLevels.BINS,
		})
	}

	return (
		<UserLocation
			visible={true}
			androidRenderMode="normal"
			showsUserHeadingIndicator={true}
			requestsAlwaysUse={true}
			onPress={handlePress}
		/>
	)
}

export default UserLocationMarker
