import { BinType } from '@/shared/types/bins'
import { BIN_MARKER_ICONS } from '@map/constants/binMarkerIcons'
import { CircleLayer, ShapeSource, SymbolLayer } from '@rnmapbox/maps'
import { useRef } from 'react'

interface MapBinMarkerProps {
	point: any
	onPress?: (point: any) => void
	isActive?: boolean
}

const MapBinMarker = ({ point, onPress, isActive }: MapBinMarkerProps) => {
	const { binType, containerId } = point.properties
	// Usar solo binType-containerId (containerId ya es único sin prefijo "bin-")
	const sourceIdRef = useRef(`${binType}-${containerId}`)

	const { color } = BIN_MARKER_ICONS[binType as BinType]

	const handleBinMarkerPress = () => onPress?.(point)

	// Crear GeoJSON para el punto
	const pointGeoJSON = {
		type: 'FeatureCollection' as const,
		features: [
			{
				type: 'Feature' as const,
				geometry: point.geometry,
				properties: {
					...point.properties,
					binType,
					color,
				},
			},
		],
	}

	return (
		<ShapeSource
			id={sourceIdRef.current}
			shape={pointGeoJSON}
			onPress={handleBinMarkerPress}
			hitbox={{ width: 32, height: 32 }}
		>
			<CircleLayer
				id={`circle-${binType}-${containerId}`}
				style={{
					circleRadius: 16,
					circleColor: color,
					circleStrokeWidth: 2,
					circleStrokeColor: '#ffffff',
					circleOpacity: 1,
				}}
			/>
			<SymbolLayer
				id={`icon-${binType}-${containerId}`}
				style={{
					iconImage: `icon-${binType}`,
					iconSize: 0.4,
					iconAllowOverlap: true,
					iconIgnorePlacement: true,
				}}
			/>
		</ShapeSource>
	)
}

export default MapBinMarker
