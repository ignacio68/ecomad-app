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
				clearChip()

				const selectedChipData = chips.find(chip => chip.id === chipId)
				const endPoint = selectedChipData?.endPoint

				if (selectedChip === chipId) {
					setMapBottomSheetTitle('')
					return
				}

				if (endPoint) {
					try {
						await ensureDataAvailable(endPoint)
					} catch (error) {
						console.error(`❌ Error ensuring data for ${endPoint}:`, error)
						showAlert(title)
						return
					}

					const totalCount = useBinsCountStore
						.getState()
						.getTotalCount(endPoint)

					if (totalCount === 0) {
						showAlert(title)
						return
					}

					// Solo abrir bottom sheet si hay datos
					setSelectedChip(chipId, endPoint)
					setMapBottomSheetTitle(title)
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
