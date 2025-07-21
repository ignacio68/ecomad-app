import type { IconSvgElement } from '@hugeicons/react-native'
import { useState } from 'react'
import { FlatList, View } from 'react-native'
import { CustomButton } from './CustomButton/CustomButton'
import { CustomButtonProps } from './CustomButton/types'

interface Chip {
	id: string
	title: string
	icon?: IconSvgElement
	iconSelected?: IconSvgElement
	isSelected?: boolean
	onPress: () => void
}

interface ChipsContainerProps {
	chips: CustomButtonProps[]
	containerClassName?: string
	scrollViewClassName?: string
}

const ChipsContainer = ({
	chips,
	containerClassName = '',
	scrollViewClassName = '',
}: ChipsContainerProps) => {
	const [selectedChip, setSelectedChip] = useState<string | null>(null)

	const handleChipPress = (chipId: string, originalOnPress?: () => void) => {
		setSelectedChip(chipId)
		if (originalOnPress) {
			originalOnPress()
		}
	}

	return (
		<View className={containerClassName}>
			<FlatList
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{ gap: 8, paddingRight: 24 }}
				className={scrollViewClassName}
				data={chips}
				renderItem={({ item }) => (
					<View key={item.id}>
						<CustomButton
							id={item.id}
							title={item.title}
							mode={item.mode}
							flavor="chip"
							icon={item.icon}
							iconSelected={item.iconSelected}
							isSelected={selectedChip === item.id}
							onPress={() => handleChipPress(item.id, item.onPress)}
							testID={`chip-${item.id}`}
						/>
					</View>
				)}
				keyExtractor={item => item.id}
			/>
		</View>
	)
}

export default ChipsContainer
