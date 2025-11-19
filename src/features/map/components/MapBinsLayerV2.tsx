import { useHierarchicalBins } from '@map/components/markers/hooks/useHierarchicalBins'
import { createFallbackBounds } from '@map/services/mapService'
import { useMapBottomSheetStore } from '@map/stores/mapBottomSheetStore'
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
	const deactivateRouteIfActive = useMapNavigationStore(
		state => state.deactivateRouteIfActive,
	)
	const hasActiveRoute = useMapNavigationStore(state => state.hasActiveRoute)
	const shouldHideClusters = useMapNavigationStore(
		state => state.shouldHideClusters,
	)
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
				useMapNavigationStore.setState({ shouldHideClusters: false })
				const { viewport, updateValidatedViewport } =
					useMapViewportStore.getState()
				if (viewport?.zoom && viewport?.center) {
					const safeBounds =
						viewport.bounds ??
						createFallbackBounds(
							viewport.center.lng,
							viewport.center.lat,
							viewport.zoom,
						)
					updateValidatedViewport(viewport.zoom, safeBounds, viewport.center)
				}
				reset()
			} else {
				setSelectedCluster(null)
				setSelectedBin(point)
				setIsMapBottomSheetOpen(true)
				setViewportAnimated({
					zoom: MapZoomLevels.BINS,
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

	// Colección GeoJSON para todos los bins visibles
	const binsFeatureCollection = useMemo(() => {
		const features = visibleBins.map(bin => {
			const binType = bin.properties.binType
			const color = BIN_MARKER_ICONS[binType]?.color ?? '#0074d9'

			return {
				type: 'Feature' as const,
				geometry: bin.geometry,
				properties: {
					...bin.properties,
					color,
					iconId: `icon-${binType}`,
				},
			}
		})

		return {
			type: 'FeatureCollection' as const,
			features,
		}
	}, [visibleBins])

	const handleBinShapePress = useCallback(
		(event: any) => {
			const feature = event?.features?.[0]
			if (!feature) return
			handleBinPress(feature)
		},
		[handleBinPress],
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
			{!shouldHideClusters &&
				!hasActiveRoute &&
				clusterItems.map(cluster => {
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
			{!hasActiveRoute && !shouldHideClusters && binsFeatureCollection.features.length > 0 && (
				<ShapeSource
					id="bins-shape-source"
					shape={binsFeatureCollection}
					onPress={handleBinShapePress}
					hitbox={{ width: 24, height: 24 }}
				>
					<CircleLayer
						id="bins-circle-layer"
						style={{
							circleRadius: 10,
							circleColor: ['get', 'color'],
							circleStrokeWidth: 1.5,
							circleStrokeColor: '#ffffff',
							circleOpacity: 1,
						}}
					/>
					<SymbolLayer
						id="bins-symbol-layer"
						style={{
							iconImage: ['get', 'iconId'],
							iconSize: 0.65,
							iconAllowOverlap: true,
							iconIgnorePlacement: true,
							iconOpacity: 0.95,
						}}
					/>
				</ShapeSource>
			)}

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
