import React, { useCallback } from 'react'
import { useSuperclusterBins } from '../hooks/useSuperclusterBins'
import { useMapBottomSheetStore } from '../stores/mapBottomSheetStore'
import {
	useMapViewportStore,
	type MapViewportStore,
} from '../stores/mapViewportStore'
import { MapZoomLevels } from '../types/mapData'
import BinMarker from './markers/BinMarker'
import ClusterMarker from './markers/ClusterMarker'

const scheduleViewportUpdate = (
	setViewportAnimated: MapViewportStore['setViewportAnimated'],
	center: { lat: number; lng: number } | null,
	zoom: number,
	delay = 150,
) => {
	const currentViewport = useMapViewportStore.getState().viewport
	const targetCenter = center ?? currentViewport.center
	if (!targetCenter) {
		return
	}
	const sameCenter =
		Math.abs(currentViewport.center?.lat ?? 0 - targetCenter.lat) < 1e-5 &&
		Math.abs(currentViewport.center?.lng ?? 0 - targetCenter.lng) < 1e-5
	const sameZoom = Math.abs((currentViewport.zoom ?? 0) - zoom) < 1e-3

	if (sameCenter && sameZoom) {
		return
	}

	requestAnimationFrame(() => {
		setTimeout(() => {
			setViewportAnimated({ center: targetCenter, zoom })
		}, delay)
	})
}

export const SuperclusterMarkers: React.FC = () => {
	const { clusters, getClusterExpansionZoom, isLoading } = useSuperclusterBins()
	const { setViewportAnimated } = useMapViewportStore()
	const {
		markerState,
		setSelectedBin,
		setSelectedCluster,
		setMarkerType,
		reset,
	} = useMapBottomSheetStore()

	// Log de debug para renderizado - solo cuando cambia el número de clusters
	React.useEffect(() => {
		console.log(
			`🔍 SuperclusterMarkers render: ${clusters.length} clusters, loading: ${isLoading}`,
		)
	}, [clusters.length, isLoading])

	// Manejar clic en cluster
	const handleClusterPress = useCallback(
		(cluster: any) => {
			const expansionZoom = getClusterExpansionZoom(cluster.id)
			const [longitude, latitude] = cluster.geometry.coordinates

			setSelectedCluster(cluster)
			setMarkerType('cluster')

			scheduleViewportUpdate(
				setViewportAnimated,
				{ lat: latitude, lng: longitude },
				expansionZoom,
				100,
			)
		},
		[
			getClusterExpansionZoom,
			setMarkerType,
			setSelectedCluster,
			setViewportAnimated,
		],
	)

	// Manejar clic en bin
	const handleBinPress = useCallback(
		(point: any) => {
			const [longitude, latitude] = point.geometry.coordinates

			if (
				markerState.selectedBin?.properties.containerId ===
				point.properties.containerId
			) {
				reset()
				scheduleViewportUpdate(
					setViewportAnimated,
					null,
					MapZoomLevels.CLUSTER,
					0,
				)
			} else {
				setSelectedCluster(null)
				setSelectedBin(point)
				setMarkerType('bin')
				scheduleViewportUpdate(
					setViewportAnimated,
					{ lat: latitude, lng: longitude },
					MapZoomLevels.CONTAINER,
					0,
				)
			}
		},
		[
			markerState.selectedBin,
			reset,
			setMarkerType,
			setSelectedBin,
			setSelectedCluster,
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
					return (
						<BinMarker
							key={cluster.properties.containerId}
							point={cluster}
							onPress={() => handleBinPress(cluster)}
							isActive={
								markerState.selectedBin?.properties.containerId ===
								cluster.properties.containerId
							}
						/>
					)
				}
			})}
		</>
	)
}
