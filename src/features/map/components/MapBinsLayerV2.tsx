import { useHierarchicalBins } from '@map/components/markers/hooks/useHierarchicalBins'
import { useMapBottomSheetStore } from '@map/stores/mapBottomSheetStore'
import { useMapChipsMenuStore } from '@map/stores/mapChipsMenuStore'
import { useMapNavigationStore } from '@map/stores/mapNavigationStore'
import { useMapViewportStore } from '@map/stores/mapViewportStore'
import { useUserLocationFABStore } from '@map/stores/userLocationFABStore'
import { MapZoomLevels } from '@map/types/mapData'
import { CircleLayer, Images, ShapeSource, SymbolLayer } from '@rnmapbox/maps'
import React, { useCallback, useMemo } from 'react'
import { BIN_MARKER_ICONS } from '../constants/binMarkerIcons'
import HeroMarker from './markers/HeroMarker'
import MapClusterMarkerV2 from './markers/MapClusterMarkerV2'

const MapBinsLayerV2 = () => {
	const { clusters } = useHierarchicalBins()
	const { selectedEndPoint } = useMapChipsMenuStore()
	const { deactivateRouteIfActive } = useMapNavigationStore()
	const { setViewportAnimated } = useMapViewportStore()
	const { deactivateUserLocation } = useUserLocationFABStore()
	const {
		markerState,
		setSelectedBin,
		setSelectedCluster,
		setIsMapBottomSheetOpen,
		reset,
	} = useMapBottomSheetStore()

	// Separar clusters y bins individuales
	const { clusterItems, binItems } = useMemo(() => {
		const clusterItems: any[] = []
		const binItems: any[] = []

		for (const item of clusters) {
			if (item?.properties?.cluster) {
				clusterItems.push(item)
			} else if (item?.properties?.containerId && item?.properties?.binType) {
				binItems.push(item)
			}
		}

		return { clusterItems, binItems }
	}, [clusters])

	// Filtrar bins visibles (excluir el seleccionado)
	const visibleBins = useMemo(() => {
		const selectedBinId = markerState.selectedBin?.properties?.containerId
		return binItems.filter(b => {
			const containerId = b?.properties?.containerId
			return !selectedBinId || String(containerId) !== String(selectedBinId)
		})
	}, [binItems, markerState.selectedBin])

	// Crear GeoJSON FeatureCollection con todos los bins visibles
	const binsGeoJSON = useMemo(() => {
		if (visibleBins.length === 0) return null

		return {
			type: 'FeatureCollection' as const,
			features: visibleBins.map(bin => {
				const binType = bin.properties.binType as string
				const iconConfig =
					BIN_MARKER_ICONS[binType as keyof typeof BIN_MARKER_ICONS]
				return {
					type: 'Feature' as const,
					geometry: bin.geometry,
					properties: {
						...bin.properties,
						color: iconConfig?.color || '#666666',
					},
				}
			}),
		}
	}, [visibleBins])

	const handleClusterPress = useCallback(
		(cluster: any) => {
			console.log('🎯 [CLUSTER_PRESS] Cluster pressed:', {
				level: cluster.properties.clusterLevel,
				count: cluster.properties.point_count,
				district: cluster.properties.districtName,
				neighborhood: cluster.properties.neighborhoodName,
			})

			// Desactivar seguimiento de ubicación del usuario (como Google Maps y Apple Maps)
			// Mantener la ruta activa si existe
			deactivateUserLocation({ keepRoute: true })

			setSelectedCluster(cluster)
			setIsMapBottomSheetOpen(true)

			// Hacer zoom al cluster
			const [longitude, latitude] = cluster.geometry.coordinates
			const targetZoom = 14.7

			setViewportAnimated({
				zoom: targetZoom,
				center: { lng: longitude, lat: latitude },
			})
		},
		[
			setSelectedCluster,
			setIsMapBottomSheetOpen,
			setViewportAnimated,
			deactivateUserLocation,
		],
	)

	const handleBinPress = useCallback(
		(event: any) => {
			// event.features contiene los features clickeados
			const feature = event?.features?.[0]
			if (!feature) return

			const point = {
				type: 'Feature' as const,
				geometry: feature.geometry,
				properties: feature.properties,
			}

			console.log('🎯 [BIN_PRESS] Bin pressed:', {
				containerId: point?.properties?.containerId,
				binType: point?.properties?.binType,
				hasCoordinates: !!point?.geometry?.coordinates,
			})

			if (!point?.geometry?.coordinates || !point?.properties?.containerId) {
				console.warn('⚠️ [BIN_PRESS] Invalid point structure:', point)
				return
			}

			const [longitude, latitude] = point.geometry.coordinates

			if (
				markerState.selectedBin?.properties.containerId ===
				point.properties.containerId
			) {
				deactivateRouteIfActive()
				reset()
			} else {
				// Desactivar ruta si existe al seleccionar un bin diferente
				deactivateRouteIfActive()
				setSelectedCluster(null)
				setSelectedBin(point)
				setIsMapBottomSheetOpen(true)
				setViewportAnimated({
					zoom: MapZoomLevels.CONTAINER,
					center: { lng: longitude, lat: latitude },
				})
			}
		},
		[
			deactivateRouteIfActive,
			markerState.selectedBin,
			reset,
			setSelectedBin,
			setSelectedCluster,
			setIsMapBottomSheetOpen,
			setViewportAnimated,
		],
	)

	// Cargar todos los iconos una sola vez
	const allIcons = useMemo(() => {
		const icons: Record<string, any> = {}
		for (const [binType, config] of Object.entries(BIN_MARKER_ICONS)) {
			icons[`icon-${binType}`] = config.default
		}
		return icons
	}, [])

	return (
		<>
			{/* Cargar iconos una sola vez para todos los bins */}
			<Images images={allIcons} />

			{/* Renderizar clusters jerárquicos */}
			{clusterItems.map(c => {
				const coords = c?.geometry?.coordinates as [number, number]
				const clusterId =
					c?.properties?.cluster_id ?? `${coords?.[0]}-${coords?.[1]}`
				return (
					<MapClusterMarkerV2
						key={`cluster-v2-${clusterId}`}
						cluster={c}
						onPress={handleClusterPress}
					/>
				)
			})}

			{/* Renderizar todos los bins en un único ShapeSource */}
			{binsGeoJSON && (
				<ShapeSource
					id={`bins-source-${selectedEndPoint || 'default'}`}
					shape={binsGeoJSON}
					onPress={handleBinPress}
					hitbox={{ width: 32, height: 32 }}
				>
					<CircleLayer
						id={`bins-circles-${selectedEndPoint || 'default'}`}
						style={{
							circleRadius: 16,
							circleColor: ['get', 'color'],
							circleStrokeWidth: 2,
							circleStrokeColor: '#ffffff',
							circleOpacity: 1,
						}}
					/>
					<SymbolLayer
						id={`bins-icons-${selectedEndPoint || 'default'}`}
						style={{
							iconImage: ['concat', 'icon-', ['get', 'binType']],
							iconSize: 0.4,
							iconAllowOverlap: true,
							iconIgnorePlacement: true,
						}}
					/>
				</ShapeSource>
			)}

			{/* Hero marker para el bin seleccionado */}
			{markerState?.selectedBin && (
				<HeroMarker
					coordinate={markerState.selectedBin.geometry.coordinates}
					binType={markerState.selectedBin.properties.binType}
					onPress={() =>
						handleBinPress({ features: [markerState.selectedBin] })
					}
				/>
			)}
		</>
	)
}

export default MapBinsLayerV2
