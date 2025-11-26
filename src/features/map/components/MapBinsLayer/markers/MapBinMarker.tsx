import { BIN_MARKER_ICONS } from '@map/constants/binMarkerIcons'
import type { BinPoint } from '@map/types/mapData'
import { CircleLayer, ShapeSource, SymbolLayer } from '@rnmapbox/maps'

interface MapBinMarkerProps {
	point: BinPoint
	onPress?: (point: BinPoint) => void
}

const MapBinMarker = ({ point, onPress }: MapBinMarkerProps) => {
	const { binType, binId } = point.properties
	const iconConfig = BIN_MARKER_ICONS[binType]

	if (!iconConfig) {
		console.error(
			`❌ [MAPBINMARKER] No icon config found for binType: ${binType}`,
		)
		return null
	}

	const { color } = iconConfig

	const handleBinMarkerPress = () => {
		onPress?.(point)
	}

	// Crear GeoJSON para el punto
	const pointGeoJSON = {
		type: 'FeatureCollection' as const,
		features: [
			{
				type: 'Feature' as const,
				geometry: point.geometry,
				properties: {
					...point.properties,
					color,
					iconId: `icon-${binType}`,
				},
			},
		],
	}

	return (
		<ShapeSource
			id={`bin-${binType}-${binId}`}
			shape={pointGeoJSON}
			onPress={handleBinMarkerPress}
			hitbox={{ width: 24, height: 24 }}
		>
			<CircleLayer
				id={`bin-circle-${binType}-${binId}`}
				style={{
					circleRadius: 10,
					circleColor: color,
					circleStrokeWidth: 1.5,
					circleStrokeColor: '#ffffff',
					circleOpacity: 1,
				}}
			/>
			<SymbolLayer
				id={`bin-icon-${binType}-${binId}`}
				style={{
					iconImage: `icon-${binType}`,
					iconSize: 0.65,
					iconAllowOverlap: true,
					iconIgnorePlacement: true,
					iconOpacity: 0.95,
				}}
			/>
		</ShapeSource>
	)
}

export default MapBinMarker
