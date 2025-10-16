import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react-native'
import { Image, ImageProps } from 'expo-image'
import { Pressable } from 'react-native'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withSpring,
	withTiming,
	type SharedValue,
} from 'react-native-reanimated'
import FAB, { FABProps } from './FAB'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)
const SPRING_CONFIG = {
	duration: 1200,
	overshootClamping: true,
	dampingRatio: 0.8,
}

const OFFSET = 60

type ChildrenAsset = IconSvgElement | ImageProps

interface FABChildrenProps {
	isExpanded: SharedValue<boolean>
	index: number
	childrenAsset: ChildrenAsset
	onPress?: () => void
}

const FABChildren = ({
	isExpanded = useSharedValue(false),
	index,
	childrenAsset,
	onPress,
}: FABChildrenProps) => {
	const animatedStyles = useAnimatedStyle(() => {
		const moveValue = isExpanded.value ? OFFSET * (index + 1) : 0
		const translateValue = withSpring(-moveValue, SPRING_CONFIG)
		const delay = index * 100

		const scaleValue = isExpanded.value ? 1 : 0

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
			style={[
				animatedStyles,
				{
					position: 'absolute',
					top: 0,
					right: 0,
				},
			]}
			className={
				'h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-white shadow-lg'
			}
			accessibilityRole="button"
			accessibilityLabel={`FAB ${index}`}
			accessibilityHint={`FAB ${index}`}
			accessibilityState={{
				selected: isExpanded.value,
			}}
			onPress={onChildPress}
		>
			{typeof childrenAsset === 'object' && 'source' in childrenAsset ? (
				<Image
					source={childrenAsset.source}
					style={{
						width: 44,
						height: 44,
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
	const isExpanded = useSharedValue(false)

	const handlePress = () => {
		isExpanded.value = !isExpanded.value
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
					isExpanded={isExpanded}
					index={index}
					childrenAsset={child.childrenAsset}
					onPress={child.onPress}
				/>
			))}
		</>
	)
}

export default FABExpanded
