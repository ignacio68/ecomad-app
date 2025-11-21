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
	const iconConfig = BIN_MARKER_ICONS[binType as BinType]

	if (!iconConfig) {
		console.error(
			`❌ [MAPBINMARKER] No icon config found for binType: ${binType}`,
		)
		return null
	}

	const { color } = iconConfig

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
			hitbox={{ width: 20, height: 20 }}
		>
			<CircleLayer
				id={`bin-circle-${binType}-${containerId}`}
				style={{
					circleRadius: 10,
					circleColor: color,
					circleStrokeWidth: 1.5,
					circleStrokeColor: '#ffffff',
					circleOpacity: 1,
				}}
			/>
			<SymbolLayer
				id={`bin-icon-${binType}-${containerId}`}
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

export default MapBinMarkerV2
