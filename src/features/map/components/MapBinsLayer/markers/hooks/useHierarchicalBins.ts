import { useMapBinsStore } from '@map/stores/mapBinsStore'
import { useMapChipsMenuStore } from '@map/stores/mapChipsMenuStore'

/**
 * Hook simplificado para manejar bins sin clustering
 */
export const useHierarchicalBins = () => {
	const { selectedEndPoint } = useMapChipsMenuStore()
	const { allPoints, filteredPoints } = useMapBinsStore()

	const binsToDisplay = filteredPoints.length > 0 ? filteredPoints : allPoints

	return {
		bins: binsToDisplay,
		points: allPoints,
		selectedBinType: selectedEndPoint,
	}
}
