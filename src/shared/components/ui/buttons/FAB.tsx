import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react-native'
import React from 'react'
import { Pressable } from 'react-native'

interface FABProps {
	name: string
	icon: IconSvgElement
	iconSelected?: IconSvgElement
	isSelected: boolean
	disabled?: boolean
	loading?: boolean
	onPress: () => void
}

const FAB = React.memo(
	({
		name,
		icon,
		iconSelected,
		isSelected = false,
		disabled = false,
		loading = false,
		onPress,
	}: FABProps) => {
		const getIcon = () => (isSelected ? iconSelected : icon)

		const getIconColor = () => (isSelected ? 'red' : '#111111')

		return (
			<Pressable
				onPress={onPress}
				disabled={disabled || loading}
				className={`rounded-xl shadow-xl h-14 w-14 flex-1 flex-row items-center justify-center bg-white `}
				accessibilityRole="button"
				accessibilityLabel="Fab"
				accessibilityHint="Presiona para abrir la pantalla de mapa"
				accessibilityState={{
					disabled: disabled || loading,
					selected: isSelected,
					busy: loading,
				}}
				accessibilityLiveRegion={loading ? 'polite' : undefined}
			>
				<HugeiconsIcon
					icon={getIcon()}
					size={24}
					color={getIconColor()}
					accessibilityLabel={`Icono de FAB ${name}`}
				/>
			</Pressable>
		)
	},
)

export default FAB
