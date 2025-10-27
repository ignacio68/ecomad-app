import { BinType } from '@/shared/types/bins'
import { BIN_MARKER_ICONS } from '@map/constants/binMarkerIcons'
import { CircleLayer, Images, ShapeSource, SymbolLayer } from '@rnmapbox/maps'
import React from 'react'

interface MapBinMarkerProps {
	point: any
	onPress?: (point: any) => void
	isActive?: boolean
}

const MapBinMarker: React.FC<MapBinMarkerProps> = ({
	point,
	onPress,
	isActive,
}) => {
	const { binType } = point.properties

	const {
		color,
		default: DefaultIcon,
	} = BIN_MARKER_ICONS[binType as BinType]

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
		<>
			<Images
				images={{
					icon: DefaultIcon,
				}}
			/>
			<ShapeSource
				id={`bin-${point.properties.containerId}`}
				shape={pointGeoJSON}
				onPress={handleBinMarkerPress}
				hitbox={{ width: 32, height: 32 }}
			>
				<CircleLayer
					id={`bin-circle-${point.properties.containerId}`}
					style={{
						circleRadius: 16,
						circleColor: color,
						circleStrokeWidth: 2,
						circleStrokeColor: '#ffffff',
						circleOpacity: 1,
					}}
				/>
				<SymbolLayer
					id={`bin-icon-layer-${point.properties.containerId}`}
					style={{
						iconImage: 'icon',
						iconSize: .4,
						iconAllowOverlap: true,
						iconIgnorePlacement: true,
					}}
				/>
			</ShapeSource>
		</>
	)
}

export default MapBinMarker
