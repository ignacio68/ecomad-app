import { getContainersData } from '@/db/bins/service'
import { useMapBinsStore } from '@map/stores/mapBinsStore'
import { useMapChipsMenuStore } from '@map/stores/mapChipsMenuStore'
import { useMapClustersStore } from '@map/stores/mapClustersStore'
import { useEffect, useState } from 'react'

/**
 * Hook para manejar bins con clustering jerárquico
 * Reemplaza a useSuperclusterBins con una estrategia más eficiente
 */
export const useHierarchicalBins = () => {
	const { selectedEndPoint } = useMapChipsMenuStore()
	const { allPoints } = useMapBinsStore()
	const { displayClusters, setDisplayClusters } = useMapClustersStore()

	const [isUsingNearby, setIsUsingNearby] = useState(false)

	const hasNoData = !selectedEndPoint && displayClusters.length === 0

	const resetClusters = () => {
		setDisplayClusters([])
		setIsUsingNearby(false)
	}

	// Efecto para cargar datos iniciales cuando se selecciona un chip
	// NOTA: El useEffect de selectedEndPoint fue ELIMINADO
	// La carga inicial ahora se maneja imperativamente desde MapChipsContainer
	// Esto evita múltiples ejecuciones y mejora el rendimiento

	// Resetear clusters cuando no hay endpoint seleccionado
	useEffect(() => {
		if (!selectedEndPoint) {
			resetClusters()
		}
	}, [selectedEndPoint])

	// NOTA: El useEffect de zoom/viewport fue ELIMINADO
	// Ahora todo se maneja imperativamente:
	// - Carga inicial: MapChipsContainer
	// - Animación de cluster: MapBase (timeout después de animación)
	// - Pan/zoom manual: MapBase (onCameraChanged)

	// Efecto para detectar cuando el background download termina
	// y desactivar el modo nearby para permitir que onCameraChanged actualice la visualización
	useEffect(() => {
		if (!isUsingNearby || !selectedEndPoint) return

		const checkBackgroundDownload = async () => {
			const cachedBins = await getContainersData(selectedEndPoint)
			if (cachedBins && cachedBins.length > 0) {
				console.log(
					`✅ [NEARBY_POLL] Background download complete, disabling nearby mode`,
				)
				setIsUsingNearby(false)
				// onCameraChanged se encargará de actualizar la visualización automáticamente
			}
		}

		// Verificar cada 2 segundos si el download terminó
		const interval = setInterval(checkBackgroundDownload, 2000)

		return () => clearInterval(interval)
	}, [isUsingNearby, selectedEndPoint])

	if (hasNoData) {
		return {
			clusters: [],
			points: [],
			selectedBinType: null,
		}
	}

	return {
		clusters: displayClusters,
		points: allPoints,
		selectedBinType: selectedEndPoint,
	}
}
