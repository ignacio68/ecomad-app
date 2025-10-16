import { LARGE_CLUSTER_ZOOM } from '@map/constants/clustering'
import { createFallbackBounds } from '@map/services/mapService'
import { useMapBottomSheetStore } from '@map/stores/mapBottomSheetStore'
import { useMapNavigationStore } from '@map/stores/mapNavigationStore'
import { useMapViewportStore } from '@map/stores/mapViewportStore'
import { MapZoomLevels } from '@map/types/mapData'
import { useCallback } from 'react'
import BinMarker from './BinMarker'
import ClusterMarker from './ClusterMarker'
import HeroMarker from './HeroMarker'
import { useSuperclusterBins } from './hooks/useSuperclusterBins'

const SuperclusterMarkers = () => {
	const { clusters } = useSuperclusterBins()
	const { deactivateRouteIfActive } = useMapNavigationStore()
	const { setViewportAnimated } = useMapViewportStore()

	const {
		markerState,
		setSelectedBin,
		setSelectedCluster,
		setIsMapBottomSheetOpen,
		reset,
	} = useMapBottomSheetStore()

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
				// Esto activa isAnimatingRef y bloquea onCameraChanged
				setViewportAnimated({
					zoom: LARGE_CLUSTER_ZOOM,
					center: { lng: longitude, lat: latitude },
					bounds: newBounds,
				})

				console.log('⏱️ [TIMING] After setViewportAnimated:', {
					elapsed: (performance.now() - startTime).toFixed(2) + 'ms',
				})
			} catch (error) {
				console.error('❌ Error al expandir cluster:', error)
			}
		},
		[setSelectedCluster, setIsMapBottomSheetOpen, setViewportAnimated],
	)

	// Manejar clic en bin
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

				// ✅ Usar setViewportAnimated para animación consistente
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
			{clusters.map((cluster: any) => {
				const { cluster: isCluster } = cluster.properties

				if (isCluster) {
					return (
						<ClusterMarker
							key={`cluster-${cluster.id}`}
							cluster={cluster}
							onPress={() => handleClusterPress(cluster)}
						/>
					)
				} else {
					const isSelected =
						markerState.selectedBin?.properties.containerId ===
						cluster.properties.containerId
					return (
						<BinMarker
							key={cluster.properties.containerId}
							point={cluster}
							onPress={() => handleBinPress(cluster)}
							isActive={isSelected}
						/>
					)
				}
			})}

			{/* Renderizar HeroMarker solo cuando hay un bin seleccionado */}
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

export default SuperclusterMarkers
