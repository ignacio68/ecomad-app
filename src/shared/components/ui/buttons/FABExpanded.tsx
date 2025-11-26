import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react-native'
import { Image, type ImageProps } from 'expo-image'
import { Pressable } from 'react-native'
import Animated, {
	useAnimatedStyle,
	withDelay,
	withSpring,
	withTiming,
} from 'react-native-reanimated'
import FAB, { type FABProps } from './FAB'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)
const SPRING_CONFIG = {
	duration: 1200,
	overshootClamping: true,
	dampingRatio: 0.8,
}

const OFFSET = 60

type ChildrenAsset = IconSvgElement | ImageProps

interface FABChildrenProps {
	isExpanded: boolean
	index: number
	childrenAsset: ChildrenAsset
	onPress?: () => void
}

const FABChildren = ({
	isExpanded = false,
	index,
	childrenAsset,
	onPress,
	...props
}: FABChildrenProps) => {
	const animatedStyles = useAnimatedStyle(() => {
		const moveValue = isExpanded ? OFFSET * (index + 1) : 0
		const translateValue = withSpring(-moveValue, SPRING_CONFIG)
		const delay = index * 100

		const scaleValue = isExpanded ? 1 : 0

		return {
			transform: [
				{ translateX: translateValue },
				{
					scale: withDelay(delay, withTiming(scaleValue)),
				},
			],
		}
	})

	const onChildPress = () => {
		onPress?.()
	}

	return (
		<AnimatedPressable
			style={[animatedStyles]}
			className="absolute·top-0·right-0·mr-1·h-16·w-16·items-center·justify-center·rounded-full·border-2·border-white·bg-white·shadow-lg"
			accessibilityRole="button"
			accessibilityLabel={`FAB ${index}`}
			accessibilityHint={`FAB ${index}`}
			accessibilityState={{
				selected: isExpanded,
			}}
			onPress={onChildPress}
		>
			{typeof childrenAsset === 'object' && 'source' in childrenAsset ? (
				<Image
					source={childrenAsset.source}
					style={{
						width: 52,
						height: 52,
						borderRadius: 9999,
					}}
					contentFit="cover"
				/>
			) : (
				<HugeiconsIcon
					icon={childrenAsset}
					size={24}
					accessibilityLabel={`Icono de FAB ${index}`}
				/>
			)}
		</AnimatedPressable>
	)
}

interface ChildBasicProps {
	name: string
	childrenAsset: ChildrenAsset
	onPress?: () => void
}

interface FABExpandedProps extends FABProps {
	fabChildren: ChildBasicProps[]
}

const FABExpanded = ({
	name,
	icon,
	iconSelected,
	isSelected = false,
	colorSelected = '#111111',
	disabled = false,
	loading = false,
	fabChildren,
	onPress,
}: FABExpandedProps) => {
	// const isExpanded = useSharedValue(false)

	const handlePress = () => {
		// isExpanded.value = !isExpanded.value
		onPress?.() // Llamar al onPress del padre para actualizar isSelected
	}

	return (
		<>
			<FAB
				name={name}
				icon={icon}
				iconSelected={iconSelected}
				colorSelected={colorSelected}
				isSelected={isSelected}
				onPress={handlePress}
			/>
			{fabChildren?.map((child, index) => (
				<FABChildren
					key={`${child.name}-${index}`}
					isExpanded={isSelected}
					index={index}
					childrenAsset={child.childrenAsset}
					onPress={child.onPress}
				/>
			))}
		</>
	)
}

export default FABExpanded
