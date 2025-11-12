import { useHierarchicalBins } from '@map/components/markers/hooks/useHierarchicalBins'
import { useMapBottomSheetStore } from '@map/stores/mapBottomSheetStore'
import { useMapNavigationStore } from '@map/stores/mapNavigationStore'
import { useMapViewportStore } from '@map/stores/mapViewportStore'
import { useUserLocationFABStore } from '@map/stores/userLocationFABStore'
import { MapZoomLevels } from '@map/types/mapData'
import React, { useCallback, useMemo } from 'react'
import HeroMarker from './markers/HeroMarker'
import MapBinMarker from './markers/MapBinMarker'
import MapClusterMarkerV2 from './markers/MapClusterMarkerV2'
import { BIN_MARKER_ICONS } from '../constants/binMarkerIcons'
import { Images } from '@rnmapbox/maps'

const MapBinsLayerV2 = () => {
	const { clusters } = useHierarchicalBins()
	const { deactivateRouteIfActive } = useMapNavigationStore()
	const { setViewportAnimated } = useMapViewportStore()
	const { deactivateUserLocation } = useUserLocationFABStore()
	const {
		markerState,
		isBinSelected,
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
		(point: any) => {
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
		Object.entries(BIN_MARKER_ICONS).forEach(([binType, config]) => {
			icons[`icon-${binType}`] = config.default
		})
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

			{/* Renderizar bins individuales */}
			{visibleBins.map(b => (
				<MapBinMarker
					key={`${b.properties.binType}-${b.properties.containerId}`}
					point={b}
					onPress={handleBinPress}
					isActive={isBinSelected(String(b.properties.containerId))}
				/>
			))}

			{/* Hero marker para el bin seleccionado */}
			{markerState?.selectedBin && (
				<HeroMarker
					coordinate={markerState.selectedBin.geometry.coordinates}
					binType={markerState.selectedBin.properties.binType}
					onPress={() => handleBinPress(markerState.selectedBin)}
				/>
			)}
		</>
	)
}

export default MapBinsLayerV2
