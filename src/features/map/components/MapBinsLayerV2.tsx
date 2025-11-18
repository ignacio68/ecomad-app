import { useHierarchicalBins } from '@map/components/markers/hooks/useHierarchicalBins'
import { useMapBottomSheetStore } from '@map/stores/mapBottomSheetStore'
import { useMapNavigationStore } from '@map/stores/mapNavigationStore'
import { useMapViewportStore } from '@map/stores/mapViewportStore'
import { useUserLocationFABStore } from '@map/stores/userLocationFABStore'
import { MapZoomLevels } from '@map/types/mapData'
import { Images } from '@rnmapbox/maps'
import React, { useCallback, useMemo } from 'react'
import { BIN_MARKER_ICONS } from '../constants/binMarkerIcons'
import HeroMarker from './markers/HeroMarker'
import MapBinMarkerV2 from './markers/MapBinMarkerV2'
import MapClusterMarkerV2 from './markers/MapClusterMarkerV2'

const MapBinsLayerV2 = () => {
	const { clusters } = useHierarchicalBins()
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

		console.log(
			`🔍 [MAPBINSLAYER] Processing ${clusters.length} items from clusters`,
		)

		for (const item of clusters) {
			if (item?.properties?.cluster) {
				clusterItems.push(item)
			} else if (item?.properties?.containerId && item?.properties?.binType) {
				binItems.push(item)
			}
		}

		console.log(
			`🔍 [MAPBINSLAYER] Separated: ${clusterItems.length} clusters, ${binItems.length} bins`,
		)

		return { clusterItems, binItems }
	}, [clusters])

	// Filtrar bins visibles (excluir el seleccionado
	const visibleBins = useMemo(() => {
		const selectedBinId = markerState.selectedBin?.properties?.containerId
		const filtered = binItems.filter(b => {
			const containerId = b?.properties?.containerId
			return !selectedBinId || String(containerId) !== String(selectedBinId)
		})

		return filtered
	}, [binItems, markerState.selectedBin])

	const handleClusterPress = useCallback(
		(cluster: any) => {
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
			{clusterItems.map(cluster => {
				const coords = cluster?.geometry?.coordinates as [number, number]
				const clusterId =
					cluster?.properties?.cluster_id ?? `${coords?.[0]}-${coords?.[1]}`
				return (
					<MapClusterMarkerV2
						key={`cluster-v2-${clusterId}`}
						cluster={cluster}
						onPress={handleClusterPress}
					/>
				)
			})}

			{/* Renderizar bins individuales */}
			{visibleBins.map(bin => (
				<MapBinMarkerV2
					key={bin.properties.containerId}
					point={bin}
					onPress={handleBinPress}
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
