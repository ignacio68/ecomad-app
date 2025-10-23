import { LARGE_CLUSTER_ZOOM } from '@map/constants/clustering'
import { filterPointsForViewport } from '@map/services/binsLoader'
import { calculateAndStoreClusters } from '@map/services/clusteringService'
import { createFallbackBounds } from '@map/services/mapService'
import { useMapBinsStore } from '@map/stores/mapBinsStore'
import { useMapBottomSheetStore } from '@map/stores/mapBottomSheetStore'
import { useMapNavigationStore } from '@map/stores/mapNavigationStore'
import { useMapViewportStore } from '@map/stores/mapViewportStore'
import { MapZoomLevels } from '@map/types/mapData'
import React, { memo, useCallback, useMemo } from 'react'
import BinMarker from './BinMarker'
import ClusterMarker from './ClusterMarker'
import HeroMarker from './HeroMarker'
import { useSuperclusterBins } from './hooks/useSuperclusterBins'

const SuperclusterMarkers = () => {
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

	// Separar clusters y bins una sola vez por render
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

	// Excluir el contenedor seleccionado para evitar duplicados con el HeroMarker
	const visibleBins = useMemo(() => {
		const selectedBinId = markerState.selectedBin?.properties?.containerId
		return binItems.filter(b => {
			const containerId = b?.properties?.containerId
			return !selectedBinId || String(containerId) !== String(selectedBinId)
		})
	}, [binItems, markerState.selectedBin])

	// Manejar clic en cluster
	const handleClusterPress = useCallback(
		(cluster: any) => {
			const startTime = performance.now()
			console.log('⏱️ [TIMING] Cluster press START')

			setSelectedCluster(cluster)
			setIsMapBottomSheetOpen(true)

			try {
				const [longitude, latitude] = cluster.geometry.coordinates

				// Calcular bounds para el nuevo zoom y centro
				const newBounds = createFallbackBounds(
					longitude,
					latitude,
					LARGE_CLUSTER_ZOOM,
				)

				console.log('⏱️ [TIMING] Before setViewportAnimated:', {
					elapsed: (performance.now() - startTime).toFixed(2) + 'ms',
				})

				// ✅ Usar setViewportAnimated para que MapBase maneje la animación
				setViewportAnimated({
					zoom: LARGE_CLUSTER_ZOOM,
					center: { lng: longitude, lat: latitude },
					bounds: newBounds,
				})

				console.log('⏱️ [TIMING] After setViewportAnimated:', {
					elapsed: (performance.now() - startTime).toFixed(2) + 'ms',
				})

				// ✅ IMPERATIVO: Filtrar y calcular clusters para el nuevo zoom
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
				}, 100) // Pequeño delay para que la animación se complete
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
				<ClusterMarker
					key={`cluster-${c.id}`}
					cluster={c}
					onPress={() => handleClusterPress(c)}
				/>
			))}

			{visibleBins.map(b => (
				<BinMarker
					key={b.properties.containerId}
					point={b}
					onPress={() => handleBinPress(b)}
					isActive={isBinSelected(String(b.properties.containerId))}
				/>
			))}

			{markerState.selectedBin && (
				<HeroMarker
					coordinate={markerState.selectedBin.geometry.coordinates}
					binType={markerState.selectedBin.properties.binType}
					onPress={() => handleBinPress(markerState.selectedBin)}
				/>
			)}
		</>
	)
}

export default memo(SuperclusterMarkers)
