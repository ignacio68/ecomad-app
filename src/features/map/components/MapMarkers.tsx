import { PointAnnotation, ShapeSource } from '@rnmapbox/maps'
import React from 'react'
import { Text, View } from 'react-native'
import type { MapData } from '../hooks/useMapDataByZoom'

interface MapMarkersProps {
	mapData: MapData
}

const MapMarkers: React.FC<MapMarkersProps> = ({ mapData }) => {
	if (!mapData.data || mapData.data.length === 0) {
		return null
	}

	console.log('🎯 Rendering markers: district', mapData.data.length, 'items')

	// Crear features para el ShapeSource (solo distritos)
	const features = mapData.data
		.map((item, index) => {
			// Validar que las coordenadas sean números válidos
			const lng = Number(item.centroid.lng)
			const lat = Number(item.centroid.lat)

			// Validar que las coordenadas estén en Madrid (aproximadamente)
			if (isNaN(lng) || isNaN(lat)) {
				console.warn(`⚠️ Invalid coordinates for district ${item.distrito}:`, {
					lng,
					lat,
				})
				return null
			}

			// Validar que las coordenadas estén en el área de Madrid
			if (lat < 40.2 || lat > 40.6 || lng < -3.9 || lng > -3.5) {
				console.warn(
					`🚨 Coordinates out of Madrid area for district ${item.distrito}:`,
					{
						lat,
						lng,
						count: item.count,
					},
				)
				return null
			}

			const coordinates: [number, number] = [lng, lat]
			const properties = {
				id: index,
				distrito: item.distrito,
				count: item.count,
				type: 'district',
			}

			return {
				type: 'Feature' as const,
				geometry: {
					type: 'Point' as const,
					coordinates,
				},
				properties,
			}
		})
		.filter(
			(feature): feature is NonNullable<typeof feature> => feature !== null,
		)

	const geojson = {
		type: 'FeatureCollection' as const,
		features,
	}

	return (
		<ShapeSource id="clothing-bins-source" shape={geojson}>
			{mapData.data
				.map((item, index) => {
					// Validar coordenadas antes de renderizar
					const lng = Number(item.centroid.lng)
					const lat = Number(item.centroid.lat)

					if (isNaN(lng) || isNaN(lat)) {
						console.warn(
							`⚠️ Skipping invalid coordinates for district ${item.distrito}`,
						)
						return null
					}

					// Validar que las coordenadas estén en el área de Madrid
					if (lat < 40.2 || lat > 40.6 || lng < -3.9 || lng > -3.5) {
						console.warn(
							`🚨 Skipping coordinates out of Madrid area for district ${item.distrito}`,
						)
						return null
					}

					const coordinates: [number, number] = [lng, lat]

					return (
						<PointAnnotation
							key={`marker-district-${item.distrito}-${index}`}
							id={`marker-district-${item.distrito}-${index}`}
							coordinate={coordinates}
						>
							<MarkerPin type="district" count={item.count} />
						</PointAnnotation>
					)
				})
				.filter(
					(annotation): annotation is NonNullable<typeof annotation> =>
						annotation !== null,
				)}
		</ShapeSource>
	)
}

// Componente simple para el pin del marcador
interface MarkerPinProps {
	type: 'district' | 'neighborhood' | 'individual'
	count?: number
}

const MarkerPin: React.FC<MarkerPinProps> = ({ type, count }) => {
	const getColor = () => {
		switch (type) {
			case 'district':
				return '#3B82F6' // Azul para distritos
			case 'neighborhood':
				return '#10B981' // Verde para barrios
			case 'individual':
				return '#EF4444' // Rojo para individuales
			default:
				return '#6B7280' // Gris por defecto
		}
	}

	const getSize = () => {
		switch (type) {
			case 'district':
				return 24
			case 'neighborhood':
				return 20
			case 'individual':
				return 16
			default:
				return 16
		}
	}

	return (
		<View
			style={{
				width: getSize(),
				height: getSize(),
				backgroundColor: getColor(),
				borderRadius: getSize() / 2,
				borderWidth: 2,
				borderColor: 'white',
				alignItems: 'center',
				justifyContent: 'center',
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.3,
				shadowRadius: 4,
				elevation: 4,
			}}
		>
			<Text
				style={{
					fontSize: 10,
					fontWeight: 'bold',
					color: 'white',
				}}
			>
				{count && count > 0 ? count.toString() : '•'}
			</Text>
		</View>
	)
}

export default MapMarkers
