import { RouteData } from '@map/types/navigation'
import { buildRouteDotsByZoom } from '@map/utils/routeUtils'
import { CircleLayer, ShapeSource } from '@rnmapbox/maps'
import { useMemo, memo } from 'react'
import { useMapViewportStore } from '@map/stores/mapViewportStore'
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson'

interface RouteLayerProps {
	route: RouteData
	stepMeters?: number
	maxPoints?: number
}

const MapRouteLayer = ({
	route,
	stepMeters = 30,
	maxPoints = 1000,
}: RouteLayerProps) => {

	const zoom = useMapViewportStore(s => s.viewport.zoom)

	 const dots: FeatureCollection<Geometry, GeoJsonProperties> = useMemo(() => {
			return buildRouteDotsByZoom(route.geometry, zoom, route.id, { maxPoints })
		}, [route.id, zoom, maxPoints])

	return (
		<ShapeSource
			id={`route-dots-${route.id}`}
			shape={dots}
		>
			<CircleLayer
				id={`route-dots-layer-${route.id}`}
				style={{
					circleColor: '#0074D9',
					circleRadius: [
						'interpolate',
						['exponential', 1.2],
						['zoom'],
						10,
						2,
						14,
						4,
						18,
						7,
					],
					circleStrokeColor: '#FFFFFF',
					circleStrokeWidth: [
						'interpolate',
						['linear'],
						['zoom'],
						10,
						1,
						18,
						2,
					],
					circlePitchAlignment: 'map',
					circlePitchScale: 'map',
				}}
			/>
		</ShapeSource>
	)
}

export default memo(MapRouteLayer)
