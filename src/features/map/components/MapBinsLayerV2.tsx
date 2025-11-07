import { useHierarchicalBins } from '@map/components/markers/hooks/useHierarchicalBins'
import { useMapBottomSheetStore } from '@map/stores/mapBottomSheetStore'
import { useMapNavigationStore } from '@map/stores/mapNavigationStore'
import { useMapViewportStore } from '@map/stores/mapViewportStore'
import { MapZoomLevels } from '@map/types/mapData'
import React, { useCallback, useMemo } from 'react'
import HeroMarker from './markers/HeroMarker'
import MapBinMarker from './markers/MapBinMarker'
import MapClusterMarkerV2 from './markers/MapClusterMarkerV2'

const MapBinsLayerV2 = () => {
	const { clusters } = useHierarchicalBins()
	const { deactivateRouteIfActive } = useMapNavigationStore()
	const { setViewportAnimated } = useMapViewportStore()
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

			setSelectedCluster(cluster)
			setIsMapBottomSheetOpen(true)

			// Hacer zoom al cluster
			const [longitude, latitude] = cluster.geometry.coordinates
			const targetZoom = 14.5

			setViewportAnimated({
				zoom: targetZoom,
				center: { lng: longitude, lat: latitude },
			})
		},
		[setSelectedCluster, setIsMapBottomSheetOpen, setViewportAnimated],
	)

	const handleBinPress = useCallback(
		(point: any) => {
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

	return (
		<>
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
					key={b.properties.containerId}
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
