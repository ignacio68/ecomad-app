import { PointAnnotation, ShapeSource } from '@rnmapbox/maps'
import React, { useMemo } from 'react'
import { Text, View } from 'react-native'
import { useMapDataStore } from '../stores/mapDataStore'

const MapMarkers: React.FC = React.memo(() => {
	const { mapData } = useMapDataStore()

	// Memoizar la validación de datos vacíos
	const hasValidData = useMemo(() => {
		return mapData.data && mapData.data.length > 0
	}, [mapData.data])

	// Memoizar la creación de features para evitar recálculos
	const features = useMemo(() => {
		if (!hasValidData) return []

		return mapData.data
			.map((item, index) => {
				// Validar que las coordenadas sean números válidos
				const lng = Number(item.centroid.lng)
				const lat = Number(item.centroid.lat)

				// Validar que las coordenadas estén en Madrid (aproximadamente)
				if (isNaN(lng) || isNaN(lat)) {
					console.warn(
						`⚠️ Invalid coordinates for ${mapData.type} ${item.name}:`,
						{
							lng,
							lat,
						},
					)
					return null
				}

				// Validar que las coordenadas estén en el área de Madrid
				if (lat < 40.2 || lat > 40.6 || lng < -3.9 || lng > -3.5) {
					console.warn(
						`🚨 Coordinates out of Madrid area for ${mapData.type} ${item.name}:`,
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
					id: item.id,
					name: item.name,
					count: item.count,
					type: mapData.type,
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
	}, [mapData.data, mapData.type, hasValidData])

	// Memoizar el geojson para evitar recreaciones innecesarias
	const geojson = useMemo(() => {
		const result = {
			type: 'FeatureCollection' as const,
			features,
		}
		console.log(`🗺️ Created GeoJSON with ${features.length} features`)
		return result
	}, [features])

	// Early return después de todos los hooks
	if (!hasValidData) {
		if (mapData.type === 'containers') {
			console.log(`🎯 No containers to render (0 items)`)
		}
		return null
	}

	console.log(
		`🎯 Rendering markers: ${mapData.type}`,
		mapData.data.length,
		'items',
	)

	// Debug: mostrar algunas coordenadas para verificar
	if (mapData.data.length > 0) {
		console.log(
			`📍 Sample marker coordinates:`,
			mapData.data.slice(0, 3).map(item => ({
				name: item.name,
				lat: item.centroid.lat,
				lng: item.centroid.lng,
			})),
		)
	}

	return (
		<ShapeSource id={`${mapData.type}-source`} shape={geojson}>
			{mapData.data
				.map((item, index) => {
					// Validar coordenadas antes de renderizar
					const lng = Number(item.centroid.lng)
					const lat = Number(item.centroid.lat)

					if (isNaN(lng) || isNaN(lat)) {
						console.warn(
							`⚠️ Skipping invalid coordinates for ${mapData.type} ${item.name}`,
						)
						return null
					}

					// Validar que las coordenadas estén en el área de Madrid
					if (lat < 40.2 || lat > 40.6 || lng < -3.9 || lng > -3.5) {
						console.warn(
							`🚨 Skipping coordinates out of Madrid area for ${mapData.type} ${item.name}`,
						)
						return null
					}

					const coordinates: [number, number] = [lng, lat]

					return (
						<PointAnnotation
							key={`marker-${mapData.type}-${item.id}-${index}`}
							id={`marker-${mapData.type}-${item.id}-${index}`}
							coordinate={coordinates}
						>
							<MarkerPin
								type={
									mapData.type === 'districts'
										? 'district'
										: mapData.type === 'neighborhoods'
											? 'neighborhood'
											: 'container'
								}
								count={item.count}
							/>
						</PointAnnotation>
					)
				})
				.filter(
					(annotation): annotation is NonNullable<typeof annotation> =>
						annotation !== null,
				)}
		</ShapeSource>
	)
})

MapMarkers.displayName = 'MapMarkers'

// Componente simple para el pin del marcador
interface MarkerPinProps {
	type: 'district' | 'neighborhood' | 'container'
	count?: number
}

const MarkerPin: React.FC<MarkerPinProps> = React.memo(({ type, count }) => {
	// Memoizar los valores de color y tamaño para evitar recálculos
	const color = useMemo(() => {
		switch (type) {
			case 'district':
				return '#3B82F6' // Azul para distritos
			case 'neighborhood':
				return '#10B981' // Verde para barrios
			case 'container':
				return '#EF4444' // Rojo para contenedores
			default:
				return '#6B7280' // Gris por defecto
		}
	}, [type])

	const size = useMemo(() => {
		switch (type) {
			case 'district':
				return 24
			case 'neighborhood':
				return 24
			case 'container':
				return 26
			default:
				return 16
		}
	}, [type])

	return (
		<View
			style={{
				width: size,
				height: size,
				backgroundColor: color,
				borderRadius: size / 2,
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
					textAlign: 'center',
					lineHeight: 12,
					includeFontPadding: false,
					textAlignVertical: 'center',
				}}
			>
				{count && count > 0 ? count.toString() : '•'}
			</Text>
		</View>
	)
})

MarkerPin.displayName = 'MarkerPin'

export default MapMarkers
