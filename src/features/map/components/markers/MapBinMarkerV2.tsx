import { BinType } from '@/shared/types/bins'
import { BIN_MARKER_ICONS } from '@map/constants/binMarkerIcons'
import { CircleLayer, ShapeSource, SymbolLayer } from '@rnmapbox/maps'
import React from 'react'

interface MapBinMarkerV2Props {
	point: any
	onPress?: (point: any) => void
}

const MapBinMarkerV2: React.FC<MapBinMarkerV2Props> = ({ point, onPress }) => {
	const { binType, containerId } = point.properties
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
			id={`bin-${binType}-${containerId}`}
			shape={pointGeoJSON}
			onPress={handleBinMarkerPress}
			hitbox={{ width: 32, height: 32 }}
		>
			<CircleLayer
				id={`bin-circle-${binType}-${containerId}`}
				style={{
					circleRadius: 16,
					circleColor: color,
					circleStrokeWidth: 2,
					circleStrokeColor: '#ffffff',
					circleOpacity: 1,
				}}
			/>
			<SymbolLayer
				id={`bin-icon-${binType}-${containerId}`}
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

export default MapBinMarkerV2
