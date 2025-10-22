import ChipsContainer, {
	ChipsContainerProps,
} from '@/shared/components/ui/ChipsContainer'
import type { IconSvgElement } from '@hugeicons/react-native'
import { ensureDataAvailable } from '@map/services/binsCacheService'
import { useBinsCountStore } from '@map/stores/binsCountStore'
import { useMapBottomSheetStore } from '@map/stores/mapBottomSheetStore'
import { useMapChipsMenuStore } from '@map/stores/mapChipsMenuStore'
import React, { memo, useCallback } from 'react'
import { Alert } from 'react-native'

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

		const handleChipPress = useCallback(
			async (chipId: string, title: string, originalOnPress?: () => void) => {
				onChipPress(chipId, title)

				const selectedChipData = chips.find(chip => chip.id === chipId)
				const endPoint = selectedChipData?.endPoint

				if (selectedChip === chipId) {
					clearChip()
					setMapBottomSheetTitle('')
				} else if (endPoint) {
					setSelectedChip(chipId, endPoint)
					setMapBottomSheetTitle(title)

					const callId = Math.random().toString(36).substring(2, 11)
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

						const totalCount = useBinsCountStore
							.getState()
							.getTotalCount(endPoint)
						if (totalCount === 0) {
							Alert.alert(
								'Sin datos disponibles',
								`No hay contenedores disponibles para "${title.toUpperCase}" en este momento.`,
							)
						}
					} catch (error) {
						console.error(`❌ Error ensuring data for ${endPoint}:`, error)
					}
				}
			},
			[
				selectedChip,
				setSelectedChip,
				clearChip,
				setMapBottomSheetTitle,
				onChipPress,
				chips,
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
