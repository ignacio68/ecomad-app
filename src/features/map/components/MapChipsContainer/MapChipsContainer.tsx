import { BinsService } from '@/db/bins/service'
import ChipsContainer, {
	ChipsContainerProps,
} from '@/shared/components/ui/ChipsContainer'
import { BinsDownloadService } from '@/shared/services/binsDownloadService'
import type { IconSvgElement } from '@hugeicons/react-native'
import { ensureDataAvailable } from '@map/services/binsCacheService'
import {
	showHierarchicalClusters,
	showIndividualBins,
	showNearbyBins,
} from '@map/services/clusterDisplayService'
import { useMapBottomSheetStore } from '@map/stores/mapBottomSheetStore'
import { useMapChipsMenuStore } from '@map/stores/mapChipsMenuStore'
import { useMapNavigationStore } from '@map/stores/mapNavigationStore'
import { useMapViewportStore } from '@map/stores/mapViewportStore'
import React, { memo, useCallback, useState } from 'react'
import { Alert } from 'react-native'

const INDIVIDUAL_BINS_ZOOM_THRESHOLD = 14

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

						// Verificar si tenemos hierarchyData en cache
						let hierarchyData = await BinsService.getHierarchyData(endPoint)
						const hasHierarchyData = hierarchyData && hierarchyData.length > 0

						// Verificar si SQLite tiene bins cacheados
						const cachedBins = await BinsService.getContainersData(endPoint)
						const hasCachedBins = cachedBins && cachedBins.length > 0

						// Si no hay hierarchyData (primera vez), descargar ANTES de mostrar
						if (!hasHierarchyData) {
							console.log(
								`📥 [CHIP_PRESS] First time, downloading hierarchy data...`,
							)
							await ensureDataAvailable(endPoint)
							hierarchyData = await BinsService.getHierarchyData(endPoint)
						}

						// Mostrar según zoom
						if (effectiveZoom < INDIVIDUAL_BINS_ZOOM_THRESHOLD) {
							// Zoom bajo: Mostrar clusters
							console.log(
								`⚡ [CHIP_PRESS] Showing clusters at zoom ${effectiveZoom}`,
							)
							await showHierarchicalClusters(endPoint, effectiveZoom)
						} else if (!hasCachedBins) {
							// Zoom alto + cache vacía: Mostrar nearby
							if (lastValidatedCenter && lastValidatedBounds) {
								console.log(
									`📍 [CHIP_PRESS] High zoom + empty cache, loading nearby bins`,
								)
								const nearbyResult = await BinsDownloadService.loadNearbyBins(
									endPoint,
									{
										latitude: lastValidatedCenter.lat,
										longitude: lastValidatedCenter.lng,
										radius: 1,
									},
								)

								if (nearbyResult.success && nearbyResult.data.length > 0) {
									showNearbyBins(
										endPoint,
										nearbyResult.data,
										effectiveZoom,
										lastValidatedBounds,
										lastValidatedCenter,
										route,
									)
								} else {
									await showHierarchicalClusters(endPoint, effectiveZoom)
								}
							} else {
								await showHierarchicalClusters(endPoint, effectiveZoom)
							}
						} else {
							// Zoom alto + cache llena: Mostrar bins del viewport
							console.log(`🔍 [CHIP_PRESS] Checking bounds/center:`, {
								hasBounds: !!lastValidatedBounds,
								hasCenter: !!lastValidatedCenter,
								bounds: lastValidatedBounds,
								center: lastValidatedCenter,
							})
							if (lastValidatedBounds && lastValidatedCenter) {
								console.log(
									`⚡ [CHIP_PRESS] Showing individual bins at zoom ${effectiveZoom}`,
								)
								await showIndividualBins(
									endPoint,
									effectiveZoom,
									lastValidatedBounds,
									lastValidatedCenter,
									route,
								)
							} else {
								console.log(
									`⚠️ [CHIP_PRESS] No bounds/center, showing clusters instead`,
								)
								await showHierarchicalClusters(endPoint, effectiveZoom)
							}
						}

						// 4. Si ya teníamos hierarchyData, descargar bins completos en background
						if (hasHierarchyData) {
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

		const showAlert = (title: string) => {
			Alert.alert(
				'Sin datos disponibles',
				`No hay contenedores para ${title.toUpperCase()} disponibles en este momento.`,
			)
		}

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
