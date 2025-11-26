import { useHierarchicalBins } from '@/features/map/components/MapBinsLayer/markers/hooks/useHierarchicalBins'
import { BIN_MARKER_ICONS } from '@map/constants/binMarkerIcons'
import { createFallbackBounds } from '@map/services/mapService'
import { useMapBottomSheetStore } from '@map/stores/mapBottomSheetStore'
import { useMapNavigationStore } from '@map/stores/mapNavigationStore'
import { useMapViewportStore } from '@map/stores/mapViewportStore'
import { type BinPoint, MapZoomLevels } from '@map/types/mapData'
import { Images } from '@rnmapbox/maps'
import { useCallback, useMemo } from 'react'
import HeroMarker from './markers/HeroMarker'
import MapBinMarker from './markers/MapBinMarker'

const MapBinsLayer = () => {
	const { bins } = useHierarchicalBins()
	const deactivateRouteIfActive = useMapNavigationStore(
		state => state.deactivateRouteIfActive,
	)
	const hasActiveRoute = useMapNavigationStore(state => state.hasActiveRoute)
	const { setViewportAnimated } = useMapViewportStore()
	const { markerState, setSelectedBin, setIsMapBottomSheetOpen, reset } =
		useMapBottomSheetStore()

	// Filtrar solo bins individuales (sin clusters)
	const binItems = useMemo(() => {
		return bins.filter(
			(item): item is BinPoint =>
				!!(item?.properties?.binId && item?.properties?.binType),
		)
	}, [bins])

	// Filtrar bins visibles (excluir el seleccionado
	const binsExcludingSelected = useMemo(() => {
		const selectedBinId = markerState.selectedBin?.properties?.binId
		const filtered = binItems.filter(b => {
			const binId = b?.properties?.binId
			return !selectedBinId || binId !== selectedBinId
		})

		return filtered
	}, [binItems, markerState.selectedBin])

	const handleBinPress = useCallback(
		(point: BinPoint) => {
			const [longitude, latitude] = point.geometry.coordinates

			if (
				markerState.selectedBin?.properties.binId === point.properties.binId
			) {
				deactivateRouteIfActive()
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
			setIsMapBottomSheetOpen,
			setViewportAnimated,
		],
	)

	// Cargar todos los iconos una sola vez
	const allIcons = useMemo(() => {
		const icons: Record<string, string> = {}
		for (const [binType, config] of Object.entries(BIN_MARKER_ICONS)) {
			icons[`icon-${binType}`] = config.default
		}
		return icons
	}, [])

	return (
		<>
			{/* Cargar iconos una sola vez para todos los bins */}
			<Images images={allIcons} />
			{/* Renderizar bins individuales */}
			{!hasActiveRoute &&
				binsExcludingSelected.map(bin => (
					<MapBinMarker
						key={`${bin.properties.binType}-${bin.properties.binId}`}
						point={bin}
						onPress={handleBinPress}
					/>
				))}

			{/* Hero marker para el bin seleccionado */}
			{markerState?.selectedBin && (
				<HeroMarker
					coordinate={markerState.selectedBin.geometry.coordinates}
					binType={markerState.selectedBin.properties.binType}
					onPress={() => handleBinPress(markerState.selectedBin as BinPoint)}
				/>
			)}
		</>
	)
}

export default MapBinsLayer
