import { RouteData } from '@map/types/navigation'
import { LineLayer, ShapeSource } from '@rnmapbox/maps'

interface RouteLayerProps {
	route: RouteData | null
	visible?: boolean
}

const MapRouteLayer = ({ route, visible = true }: RouteLayerProps) => {
	if (!route || !visible) {
		console.log('🗺️ RouteLayer: No route to display', { route, visible })
		return null
	}


	return (
			<ShapeSource id="route-source" shape={route.geometry} lineMetrics={true}>
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

export default MapRouteLayer
