import { ensureDataAvailable } from '@map/services/binsCacheService'
import {
	showHierarchicalClusters,
	showIndividualBins,
} from '@map/services/clusterDisplayService'
import { useMapBinsStore } from '@map/stores/mapBinsStore'
import { useMapChipsMenuStore } from '@map/stores/mapChipsMenuStore'
import { useMapClustersStore } from '@map/stores/mapClustersStore'
import { useMapNavigationStore } from '@map/stores/mapNavigationStore'
import { useMapViewportStore } from '@map/stores/mapViewportStore'
import { useEffect, useState } from 'react'

// Umbral de zoom para mostrar bins individuales
const INDIVIDUAL_BINS_ZOOM_THRESHOLD = 14

/**
 * Hook para manejar bins con clustering jerárquico
 * Reemplaza a useSuperclusterBins con una estrategia más eficiente
 */
export const useHierarchicalBins = () => {
	const {
		lastValidatedZoom,
		lastValidatedBounds,
		lastValidatedCenter,
		viewport,
	} = useMapViewportStore()
	const { selectedEndPoint } = useMapChipsMenuStore()
	const { route } = useMapNavigationStore()
	const { allPoints } = useMapBinsStore()
	const { displayClusters, setDisplayClusters } = useMapClustersStore()

	const [isLoading, setIsLoading] = useState(false)
	const [isInitialLoad, setIsInitialLoad] = useState(true)

	const hasNoData = !selectedEndPoint && displayClusters.length === 0

	const resetClusters = () => {
		setDisplayClusters([])
		setIsLoading(false)
		setIsInitialLoad(true)
	}

	// Efecto para cargar datos iniciales cuando se selecciona un chip
	useEffect(() => {
		const loadInitialData = async () => {
			if (!selectedEndPoint) {
				resetClusters()
				return
			}

			setIsLoading(true)
			setIsInitialLoad(true)

			try {
				// Asegurar que tengamos hierarchyData (descarga si no existe)
				await ensureDataAvailable(selectedEndPoint)

				// Mostrar clusters inmediatamente
				const effectiveZoom = lastValidatedZoom ?? viewport.zoom ?? 11
				await showHierarchicalClusters(selectedEndPoint, effectiveZoom)

				setIsLoading(false)
				setIsInitialLoad(false) // Marcar que ya no es carga inicial
			} catch (error) {
				console.error('❌ [HIERARCHICAL] Error loading initial data:', error)
				resetClusters()
			}
		}

		loadInitialData()
	}, [selectedEndPoint])

	// Efecto para actualizar visualización cuando cambia el zoom o viewport
	// SOLO se ejecuta después de la carga inicial
	useEffect(() => {
		if (!selectedEndPoint || isLoading || isInitialLoad) return
		if (!lastValidatedBounds || !lastValidatedCenter) return

		const effectiveZoom = lastValidatedZoom ?? viewport.zoom ?? 11

		console.log(
			`🔄 [HIERARCHICAL] Zoom/viewport changed, updating display (zoom: ${effectiveZoom})`,
		)

		// Decidir qué mostrar según el zoom
		if (effectiveZoom < INDIVIDUAL_BINS_ZOOM_THRESHOLD) {
			// Zoom bajo: Mostrar clusters de distrito
			showHierarchicalClusters(selectedEndPoint, effectiveZoom)
		} else {
			// Zoom alto (>= 14): Mostrar bins individuales filtrados
			showIndividualBins(
				selectedEndPoint,
				effectiveZoom,
				lastValidatedBounds,
				lastValidatedCenter,
				route,
			)
		}
	}, [
		lastValidatedZoom,
		lastValidatedBounds,
		lastValidatedCenter,
		selectedEndPoint,
		isLoading,
		isInitialLoad,
		route,
	])

	if (hasNoData) {
		return {
			clusters: [],
			points: [],
			isLoading: false,
			selectedBinType: null,
		}
	}

	return {
		clusters: displayClusters,
		points: allPoints,
		isLoading,
		selectedBinType: selectedEndPoint,
	}
}
