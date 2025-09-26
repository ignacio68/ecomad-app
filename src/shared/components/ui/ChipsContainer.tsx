import React, { useCallback } from 'react'
import { FlatList, View } from 'react-native'
import Chip, { type ChipProps } from './buttons/Chip'

export interface ChipsContainerProps {
	chips: ChipProps[]
	containerClassName?: string
	scrollViewClassName?: string
	onChipPress: (chipId: string, title: string) => void
	selectedChipId?: string | null
}

const ChipsContainer = React.memo(
	({
		chips,
		containerClassName = '',
		scrollViewClassName = '',
		onChipPress,
		selectedChipId,
	}: ChipsContainerProps) => {
		const handleChipPress = useCallback(
			(chipId: string, title: string) => {
				onChipPress(chipId, title)
			},
			[onChipPress],
		)

		const renderItem = useCallback(
			({ item }: { item: ChipProps }) => (
				<View key={item.id}>
					<Chip
						id={item.id}
						title={item.title}
						mode={item.mode}
						icon={item.icon}
						iconSelected={item.iconSelected}
						isSelected={selectedChipId === item.id}
						onPress={() => handleChipPress(item.id, item.title)}
						testID={`chip-${item.id}`}
						endPoint={item.endPoint}
					/>
				</View>
			),
			[selectedChipId, handleChipPress],
		)

		const keyExtractor = useCallback((item: ChipProps) => item.id, [])

		return (
			<View className={containerClassName}>
				<FlatList
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ gap: 8, paddingRight: 24 }}
					className={scrollViewClassName}
					data={chips}
					renderItem={renderItem}
					keyExtractor={keyExtractor}
					extraData={selectedChipId}
				/>
			</View>
		)
	},
)

ChipsContainer.displayName = 'ChipsContainer'

export default ChipsContainer
