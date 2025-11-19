import { getContainersData } from '@/db/bins/service'
import ChipsContainer, {
	ChipsContainerProps,
} from '@/shared/components/ui/ChipsContainer'
import { loadNearbyBins } from '@/shared/services/binsDownloadService'
import type { IconSvgElement } from '@hugeicons/react-native'
import { INITIAL_CENTER } from '@map/constants/map'
import { ensureDataAvailable } from '@map/services/binsCacheService'
import {
	showIndividualBins,
	showNearbyBins,
} from '@map/services/clusterDisplayService'
import { useMapBottomSheetStore } from '@map/stores/mapBottomSheetStore'
import { useMapChipsMenuStore } from '@map/stores/mapChipsMenuStore'
import { useMapNavigationStore } from '@map/stores/mapNavigationStore'
import { useMapViewportStore } from '@map/stores/mapViewportStore'
import { useSuperclusterCacheStore } from '@map/stores/superclusterCacheStore'
import { convertContainersToGeoJSON } from '@map/utils/geoUtils'
import React, { memo, useCallback, useState } from 'react'

interface Chip {
	id: string
	title: string
	icon?: IconSvgElement
	iconSelected?: IconSvgElement
	isSelected?: boolean
	onPress: () => void
}

const MapChipsContainer = memo(
	({
		chips,
		containerClassName = '',
		scrollViewClassName = '',
		onChipPress,
	}: ChipsContainerProps) => {
		const { selectedChip, setSelectedChip, clearChip } = useMapChipsMenuStore()
		const { setMapBottomSheetTitle } = useMapBottomSheetStore()
		const {
			zoom,
			lastValidatedZoom,
			lastValidatedBounds,
			lastValidatedCenter,
			viewport,
		} = useMapViewportStore()
		const { route } = useMapNavigationStore()
		const [isLoading, setIsLoading] = useState(false)

		const handleChipPress = useCallback(
			async (chipId: string, title: string, originalOnPress?: () => void) => {
				// Prevenir múltiples clicks mientras carga
				if (isLoading) {
					console.log(`⏳ [CHIP_PRESS] Already loading, ignoring press`)
					return
				}

				onChipPress(chipId, title)

				const selectedChipData = chips.find(chip => chip.id === chipId)
				const endPoint = selectedChipData?.endPoint

				if (selectedChip === chipId) {
					// Si ya está seleccionado, deseleccionar
					clearChip()
					setMapBottomSheetTitle('')
					return
				}

				if (endPoint) {
					try {
						setIsLoading(true)

						// 1. Seleccionar chip INMEDIATAMENTE (feedback visual instantáneo)
						setSelectedChip(chipId, endPoint)
						setMapBottomSheetTitle(title)

						// 2. Forzar re-render antes de operaciones asíncronas
						// Esto asegura que el chip se vea seleccionado ANTES de cargar datos
						await new Promise(resolve => setTimeout(resolve, 0))

						// 3. Decidir qué mostrar según el zoom actual (imperativo, sin useEffect)
						// Usar zoom (zoom actual de la cámara) que siempre está actualizado
						const effectiveZoom = zoom ?? lastValidatedZoom ?? 11
						console.log(`🔍 [CHIP_PRESS] Zoom values:`, {
							cameraZoom: zoom,
							lastValidatedZoom,
							viewportZoom: viewport.zoom,
							effectiveZoom,
						})

						// Verificar primero el cache del store (más rápido)
						const { getPointsCache } = useSuperclusterCacheStore.getState()
						const storeCacheBins = getPointsCache(endPoint)
						const hasStoreCache = storeCacheBins && storeCacheBins.length > 0

						// Verificar SQLite si no hay cache en el store
						let hasCachedBins = hasStoreCache
						let sqliteContainers: any[] | null = null
						if (!hasStoreCache) {
							sqliteContainers = await getContainersData(endPoint)
							hasCachedBins = sqliteContainers && sqliteContainers.length > 0

							// Si hay datos en SQLite, precargar el cache del store para evitar doble verificación
							if (hasCachedBins && sqliteContainers) {
								const { setPointsCache } = useSuperclusterCacheStore.getState()
								const geoJsonBins = convertContainersToGeoJSON(
									sqliteContainers,
									endPoint,
								)
								setPointsCache(endPoint, geoJsonBins)
								console.log(
									`⚡ [CHIP_PRESS] Precached ${geoJsonBins.length} bins in store`,
								)
							}
						}

						// En zoom bajo (< 11), usar el centro de la ciudad en lugar del center del viewport
						const LOW_ZOOM_THRESHOLD = 11
						const isLowZoom = effectiveZoom < LOW_ZOOM_THRESHOLD
						const effectiveCenter = isLowZoom
							? { lat: INITIAL_CENTER[1], lng: INITIAL_CENTER[0] }
							: lastValidatedCenter

						// Mostrar bins siempre (sin clusters)
						if (hasCachedBins && lastValidatedBounds && effectiveCenter) {
							// Cache llena: Mostrar bins del viewport con muestreo proporcional
							console.log(
								`⚡ [CHIP_PRESS] Showing bins from cache at zoom ${effectiveZoom}`,
							)
							if (isLowZoom) {
								console.log(
									`📍 [CHIP_PRESS] Low zoom detected, using city center:`,
									effectiveCenter,
								)
							}
							await showIndividualBins(
								endPoint,
								effectiveZoom,
								lastValidatedBounds,
								effectiveCenter,
								route,
							)
						} else if (effectiveCenter && lastValidatedBounds) {
							// Cache vacía: Cargar nearby inmediatamente con radio dinámico y muestreo proporcional
							console.log(
								`📍 [CHIP_PRESS] Empty cache, loading nearby bins immediately`,
							)
							if (isLowZoom) {
								console.log(
									`📍 [CHIP_PRESS] Low zoom detected, using city center:`,
									effectiveCenter,
								)
							}
							const nearbyResult = await loadNearbyBins(
								endPoint,
								{
									latitude: effectiveCenter.lat,
									longitude: effectiveCenter.lng,
									radius: 1, // Se calculará dinámicamente
								},
								lastValidatedBounds,
								effectiveZoom,
							)

							if (nearbyResult.success && nearbyResult.data.length > 0) {
								showNearbyBins(
									endPoint,
									nearbyResult.data,
									effectiveZoom,
									lastValidatedBounds,
									effectiveCenter,
									route,
								)
							} else {
								console.log(`⚠️ [CHIP_PRESS] No nearby bins found`)
							}
						} else {
							console.log(
								`⚠️ [CHIP_PRESS] No bounds/center available, cannot show bins`,
							)
						}

						// Descargar conteo total y bins completos en background (no bloqueante)
						if (!hasCachedBins) {
							ensureDataAvailable(endPoint).catch((error: Error) => {
								console.error(`❌ Error ensuring data for ${endPoint}:`, error)
							})
						}
					} finally {
						setIsLoading(false)
					}
				}
			},
			[
				isLoading,
				selectedChip,
				setSelectedChip,
				clearChip,
				setMapBottomSheetTitle,
				onChipPress,
				chips,
				zoom,
				viewport,
				lastValidatedZoom,
				lastValidatedBounds,
				lastValidatedCenter,
				route,
			],
		)

		return (
			<ChipsContainer
				chips={chips}
				containerClassName={containerClassName}
				scrollViewClassName={scrollViewClassName}
				onChipPress={handleChipPress}
				selectedChipId={selectedChip}
			/>
		)
	},
)

export default MapChipsContainer
