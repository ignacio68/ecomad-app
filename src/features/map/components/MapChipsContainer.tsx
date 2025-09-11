import ChipsContainer, {
	ChipsContainerProps,
} from '@/shared/components/ui/ChipsContainer'
import { useMapChipsMenuStore } from '../stores/mapChipsMenuStore'
import type { IconSvgElement } from '@hugeicons/react-native'
import React, { useCallback } from 'react'
import { useMapBottomSheetStore } from '../stores/mapBottomSheetStore'

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

		const handleChipPress = useCallback(
			(chipId: string, title: string, originalOnPress?: () => void) => {
				onChipPress(chipId, title)
				setSelectedChip(chipId)
				setMapBottomSheetTitle(title)
			},
			[setSelectedChip, setMapBottomSheetTitle, onChipPress],
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
