import { useMapViewportStore } from '@map/stores/mapViewportStore'
import { useUserLocationStore } from '@map/stores/userLocationStore'
import { MapZoomLevels } from '@map/types/mapData'
import {UserLocation } from '@rnmapbox/maps'
import { memo, useCallback } from 'react'

const UserLocationMarker = memo(() => {
	const { location } = useUserLocationStore()
	const { setViewportAnimated } = useMapViewportStore()

	const handlePress = useCallback(() => {
		if (!location ) return
		setViewportAnimated({
			center: { lng: location.longitude, lat: location.latitude },
			zoom: MapZoomLevels.CONTAINER,
		})
	}, [location, setViewportAnimated])

	return (
		<UserLocation
			visible={true}
			androidRenderMode="compass"
			onPress={handlePress}
		/>
	)
})

export default UserLocationMarker
