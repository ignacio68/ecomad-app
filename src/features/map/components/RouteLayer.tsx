import { RouteData } from '@map/types/navigation'
import { LineLayer, ShapeSource } from '@rnmapbox/maps'
import React from 'react'

interface RouteLayerProps {
	route: RouteData | null
	visible?: boolean
}

const RouteLayer: React.FC<RouteLayerProps> = ({ route, visible = true }) => {
	if (!route || !visible) {
		console.log('🗺️ RouteLayer: No route to display', { route, visible })
		return null
	}

	console.log('🗺️ RouteLayer: Rendering route', {
		distance: route.distance,
		duration: route.duration,
		geometryType: route.geometry.geometry.type,
		coordinates: route.geometry.geometry.coordinates.length,
	})

	return (
		<ShapeSource id="route-source" shape={route.geometry}>
			<LineLayer
				id="route-line"
				style={{
					lineColor: '#0074d9',
					lineWidth: 6,
					lineOpacity: 0.8,
					lineCap: 'round',
					lineJoin: 'round',
				}}
			/>
		</ShapeSource>
	)
}

export default RouteLayer
