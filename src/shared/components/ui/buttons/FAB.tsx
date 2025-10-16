import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react-native'
import { Pressable } from 'react-native'
import Animated from 'react-native-reanimated'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export interface FABProps {
	name: string
	icon: IconSvgElement
	iconSelected?: IconSvgElement
	colorSelected?: string
	isSelected: boolean
	disabled?: boolean
	loading?: boolean
	onPress: () => void
}

const FAB =
	({
		name,
		icon,
		iconSelected,
		isSelected = false,
		colorSelected = '#111111',
		disabled = false,
		loading = false,
		onPress,
	}: FABProps) => {

		const getIcon = () => (isSelected ? iconSelected : icon)

		const getIconColor = () => (isSelected ? colorSelected : '#111111')

		return (
			<AnimatedPressable
				onPress={onPress}
				disabled={disabled || loading}
				className={`h-14 w-14 flex-1 flex-row items-center justify-center rounded-xl bg-white shadow-2xl border-[0.5px] border-gray-300`}
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
			</AnimatedPressable>
		)
	}


export default FAB
