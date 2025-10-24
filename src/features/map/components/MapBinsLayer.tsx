import { useSuperclusterBins } from '@map/components/markers/hooks/useSuperclusterBins'
import { LARGE_CLUSTER_ZOOM } from '@map/constants/clustering'
import { filterPointsForViewport } from '@map/services/binsLoader'
import { calculateAndStoreClusters } from '@map/services/clusteringService'
import { createFallbackBounds } from '@map/services/mapService'
import { useMapBinsStore } from '@map/stores/mapBinsStore'
import { useMapBottomSheetStore } from '@map/stores/mapBottomSheetStore'
import { useMapNavigationStore } from '@map/stores/mapNavigationStore'
import { useMapViewportStore } from '@map/stores/mapViewportStore'
import { MapZoomLevels } from '@map/types/mapData'
import React, { useCallback, useMemo } from 'react'
import MapBinMarker from './markers/MapBinMarker'
import MapClusterMarker from './markers/MapClusterMarker'
import HeroMarker from './markers/HeroMarker'

const MapBinsLayer = () => {
	const { clusters } = useSuperclusterBins()
	const { deactivateRouteIfActive } = useMapNavigationStore()
	const { setViewportAnimated } = useMapViewportStore()
	const { allPoints } = useMapBinsStore()
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
			console.log('⏱️ [TIMING] Cluster press START')

			setSelectedCluster(cluster)
			setIsMapBottomSheetOpen(true)

			try {
				const [longitude, latitude] = cluster.geometry.coordinates

				const newBounds = createFallbackBounds(
					longitude,
					latitude,
					LARGE_CLUSTER_ZOOM,
				)

				setViewportAnimated({
					zoom: LARGE_CLUSTER_ZOOM,
					center: { lng: longitude, lat: latitude },
					bounds: newBounds,
				})

				setTimeout(() => {
					console.log('🎯 [CLUSTER_SELECT] Recalculating for new zoom')

					const filtered = filterPointsForViewport(
						allPoints,
						LARGE_CLUSTER_ZOOM,
						newBounds,
						{ lng: longitude, lat: latitude },
						null,
					)

					useMapBinsStore.getState().setFilteredPoints(filtered)
					calculateAndStoreClusters(filtered, LARGE_CLUSTER_ZOOM, newBounds)
				}, 100)
			} catch (error) {
				console.error('❌ Error al expandir cluster:', error)
			}
		},
		[
			setSelectedCluster,
			setIsMapBottomSheetOpen,
			setViewportAnimated,
			allPoints,
		],
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
			{clusterItems.map(c => (
				<MapClusterMarker
					key={`cluster-${c.id}`}
					cluster={c}
					onPress={handleClusterPress}
				/>
			))}
			{visibleBins.map(b => (
				<MapBinMarker
					key={b.properties.containerId}
					point={b}
					onPress={handleBinPress}
					isActive={isBinSelected(String(b.properties.containerId))}
				/>
			))}
			{
				markerState?.selectedBin &&
        (
					<HeroMarker
						coordinate={markerState.selectedBin.geometry.coordinates}
						binType={markerState.selectedBin.properties.binType}
						onPress={() => handleBinPress(markerState.selectedBin)}
					/>
				)}
		</>
	)
}

export default MapBinsLayer
