import { RouteData } from '@map/types/navigation'
import { LineLayer, ShapeSource, Images } from '@rnmapbox/maps'
import { useRef} from 'react'
import {NAVIGATION_DOT} from '@map/constants/map'

interface RouteLayerProps {
	route: RouteData | null
	visible?: boolean
}

const MapRouteLayer = ({
	route,
	visible = true,
}: RouteLayerProps) => {
		const dotRouteRef = useRef<any>(null)
	if (!route || !visible) {
		console.log('🗺️ RouteLayer: No route to display', { route, visible })
		return null
	}

	const lineBaseWidth = 10

	return (
		<>
			<Images
				images={{
					['navigation-dot']: NAVIGATION_DOT.image,
				}}
			/>

			<ShapeSource id="route-source" shape={route.geometry} lineMetrics={true}>
				<LineLayer
					id="route-dot"
					ref={dotRouteRef}
					style={{
						linePattern: 'navigation-dot',
						lineColor: '#0074d9',
						lineWidth: [
							'interpolate',
							['exponential', 2],
							['zoom'],
							0,
							lineBaseWidth * 1,
							0.9999,
							lineBaseWidth * 2,
							1,
							lineBaseWidth * 1,
							1.9999,
							lineBaseWidth * 2,
							2,
							lineBaseWidth * 1,
							2.9999,
							lineBaseWidth * 2,
							3,
							lineBaseWidth * 1,
							3.9999,
							lineBaseWidth * 2,
							4,
							lineBaseWidth * 1,
							4.9999,
							lineBaseWidth * 2,
							5,
							lineBaseWidth * 1,
							5.9999,
							lineBaseWidth * 2,
							6,
							lineBaseWidth * 1,
							6.9999,
							lineBaseWidth * 2,
							7,
							lineBaseWidth * 1,
							7.9999,
							lineBaseWidth * 2,
							8,
							lineBaseWidth * 1,
							8.9999,
							lineBaseWidth * 2,
							9,
							lineBaseWidth * 1,
							9.9999,
							lineBaseWidth * 2,
							10,
							lineBaseWidth * 1,
							10.9999,
							lineBaseWidth * 2,
							11,
							lineBaseWidth * 1,
							11.9999,
							lineBaseWidth * 2,
							12,
							lineBaseWidth * 1,
							12.9999,
							lineBaseWidth * 2,
							13,
							lineBaseWidth * 1,
							13.9999,
							lineBaseWidth * 2,
							14,
							lineBaseWidth * 1,
							14.9999,
							lineBaseWidth * 2,
							15,
							lineBaseWidth * 1,
							15.9999,
							lineBaseWidth * 2,
							16,
							lineBaseWidth * 1,
							16.9999,
							lineBaseWidth * 2,
							17,
							lineBaseWidth * 1,
							17.9999,
							lineBaseWidth * 2,
							18,
							lineBaseWidth * 1,
							18.9999,
							lineBaseWidth * 2,
							19,
							lineBaseWidth * 1,
							19.9999,
							lineBaseWidth * 2,
							20,
							lineBaseWidth * 1,
							20.9999,
							lineBaseWidth * 2,
							21,
							lineBaseWidth * 1,
							22,
							lineBaseWidth * 2,
						]	,
						lineJoin: 'none',
					}}
				/>
			</ShapeSource>
		</>
	)
}

export default MapRouteLayer
