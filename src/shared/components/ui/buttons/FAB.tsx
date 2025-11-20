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

		const getIconColor = () => (isSelected ? colorSelected : '#1D1B20')

		return (
			<Pressable
				onPress={onPress}
				disabled={disabled || loading}
				className={`ios:shadow-sm android:shadow-md android:shadow-black/80 h-14 w-14 flex-1 flex-row items-center justify-center rounded-xl border-[0.5px] border-gray-300 bg-white`}
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
					icon={icon}
					altIcon={iconSelected}
					showAlt={isSelected}
					size={24}
					color={getIconColor()}
					accessibilityLabel={`Icono de FAB ${name}`}
				/>
			</Pressable>
		)
	}


export default FAB
