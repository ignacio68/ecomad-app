import ChipsContainer, {
	ChipsContainerProps,
} from '@/shared/components/ui/ChipsContainer'
import type { IconSvgElement } from '@hugeicons/react-native'
import React, { useCallback } from 'react'
import { useLocalBinsCache } from '../hooks/useLocalBinsCache'
import { useMapBottomSheetStore } from '../stores/mapBottomSheetStore'
import { useMapChipsMenuStore } from '../stores/mapChipsMenuStore'

interface Chip {
	id: string
	title: string
	icon?: IconSvgElement
	iconSelected?: IconSvgElement
	isSelected?: boolean
	onPress: () => void
}

const MapChipsContainer = React.memo(
	({
		chips,
		containerClassName = '',
		scrollViewClassName = '',
		onChipPress,
	}: ChipsContainerProps) => {
		const { selectedChip, setSelectedChip } = useMapChipsMenuStore()
		const { setMapBottomSheetTitle } = useMapBottomSheetStore()
		const { ensureDataAvailable } = useLocalBinsCache()

		const handleChipPress = useCallback(
			async (chipId: string, title: string, originalOnPress?: () => void) => {
				onChipPress(chipId, title)

				// Encontrar el chip para obtener su endPoint
				const selectedChipData = chips.find(chip => chip.id === chipId)
				const endPoint = selectedChipData?.endPoint

				// Toggle logic: si el chip ya está seleccionado, lo deseleccionamos
				if (selectedChip === chipId) {
					setSelectedChip('') // Deseleccionar sin endPoint
					setMapBottomSheetTitle('') // Limpiar título
				} else {
					setSelectedChip(chipId, endPoint) // Seleccionar con endPoint
					setMapBottomSheetTitle(title)

					// Asegurar que los datos estén disponibles en cache local
					if (endPoint) {
						const callId = Math.random().toString(36).substr(2, 9)
						console.log(
							`🔄 [${callId}] Ensuring data availability for ${endPoint}...`,
						)
						console.log(`📍 [${callId}] Called from MapChipsContainer.tsx`)
						const startTime = Date.now()

						try {
							await ensureDataAvailable(endPoint)
							const endTime = Date.now()
							const duration = endTime - startTime
							console.log(
								`✅ [${callId}] Data ensured for ${endPoint} (took ${duration}ms)`,
							)
						} catch (error) {
							console.error(`❌ Error ensuring data for ${endPoint}:`, error)
						}
					}
				}
			},
			[
				selectedChip,
				setSelectedChip,
				setMapBottomSheetTitle,
				onChipPress,
				chips,
				ensureDataAvailable,
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
