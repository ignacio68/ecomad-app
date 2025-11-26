import {
	HERO_MARKER_ELEVATION,
	HERO_MARKER_SHADOW_OPACITY,
	HERO_MARKER_SHADOW_RADIUS,
	HERO_MARKER_SIZE,
	HERO_MARKER_TRIANGLE_MARGIN_BOTTOM,
	HERO_MARKER_TRIANGLE_MARGIN_TOP,
	HERO_MARKER_TRIANGLE_SIZE,
} from '@/features/map/constants/markers'
import type { BinType } from '@/shared/types/bins'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { BIN_MARKER_ICONS } from '@map/constants/binMarkerIcons'
import { MarkerView } from '@rnmapbox/maps'
import { useEffect, useMemo, useRef } from 'react'
import { Animated, Pressable, View } from 'react-native'

interface HeroMarkerProps {
	coordinate: [number, number]
	binType: BinType
	onPress?: () => void
}

const HeroMarker = ({ coordinate, binType, onPress }: HeroMarkerProps) => {
	const { color, active: ActiveIcon } = BIN_MARKER_ICONS[binType]
	const heroScale = useRef(new Animated.Value(0)).current

	const heroAnimatedStyle = useMemo(
		() => ({
			transform: [{ scale: heroScale }],
			opacity: heroScale,
		}),
		[heroScale],
	)

	useEffect(() => {
		Animated.spring(heroScale, {
			toValue: 1,
			useNativeDriver: true,
			friction: 7,
			tension: 170,
		}).start()
	}, [heroScale])

	return (
		<MarkerView coordinate={coordinate} anchor={{ x: 0.5, y: 0.8 }}>
			<Pressable onPress={onPress}>
				<Animated.View
					className="items-center"
					style={[
						heroAnimatedStyle,
						{
							paddingBottom: 15,
						},
					]}
				>
					<Animated.View
						style={{
							width: HERO_MARKER_SIZE,
							height: HERO_MARKER_SIZE,
							backgroundColor: color,
							borderRadius: '100%',
							borderWidth: 3,
							borderColor: '#fff',
							alignItems: 'center',
							justifyContent: 'center',
							zIndex: 10,
							shadowColor: '#000',
							shadowOffset: { width: 0, height: 8 },
							shadowOpacity: HERO_MARKER_SHADOW_OPACITY,
							shadowRadius: HERO_MARKER_SHADOW_RADIUS,
							elevation: HERO_MARKER_ELEVATION,
						}}
					>
						<HugeiconsIcon
							icon={ActiveIcon}
							size={28}
							color="white"
							strokeWidth={0}
						/>
					</Animated.View>
					<View
						style={{
							width: HERO_MARKER_TRIANGLE_SIZE,
							height: HERO_MARKER_TRIANGLE_SIZE,
							backgroundColor: '#fff',
							transform: [{ rotate: '45deg' }],
							marginTop: HERO_MARKER_TRIANGLE_MARGIN_TOP,
							marginBottom: HERO_MARKER_TRIANGLE_MARGIN_BOTTOM,
						}}
					/>
				</Animated.View>
			</Pressable>
		</MarkerView>
	)
}

export default HeroMarker
