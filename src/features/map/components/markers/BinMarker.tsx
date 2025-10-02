import { BIN_MARKER_ICONS } from '@/features/map/constants/binMarkerIcons'
import { BinType } from '@/shared/types/bins'
import {
	BIN_MARKER_ICON_SIZE,
	HERO_MARKER_SIZE,
	HERO_MARKER_ELEVATION,
	HERO_MARKER_SHADOW_RADIUS,
	HERO_MARKER_SHADOW_OPACITY,
	HERO_MARKER_TRIANGLE_MARGIN_TOP,
	HERO_MARKER_TRIANGLE_MARGIN_BOTTOM,
} from '@/features/map/constants/clustering'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { MarkerView } from '@rnmapbox/maps'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Pressable, View } from 'react-native'

interface BinMarkerProps {
	point: any
	onPress?: (point: any) => void
	isActive?: boolean
}

const BinMarker: React.FC<BinMarkerProps> = ({ point, onPress, isActive }) => {
	const { binType } = point.properties
	const [longitude, latitude] = point.geometry.coordinates

	const {
		color,
		default: DefaultIcon,
		active: ActiveIcon,
	} = BIN_MARKER_ICONS[binType as BinType]

	const IconComponent = isActive ? ActiveIcon : DefaultIcon

	const markerScale = useRef(new Animated.Value(1)).current
	const heroScale = useRef(new Animated.Value(0)).current
	const [showHero, setShowHero] = useState(false)

	const markerAnimatedStyle = useMemo(
		() => ({
			transform: [{ scale: markerScale }],
			opacity: markerScale.interpolate({
				inputRange: [0.2, 1],
				outputRange: [0.6, 1],
				extrapolate: 'clamp',
			}),
		}),
		[markerScale],
	)

	const heroAnimatedStyle = useMemo(
		() => ({
			transform: [
				{
					translateY: heroScale.interpolate({
						inputRange: [0, 0.72],
						outputRange: [0, -28],
					}),
				},
				{ scale: heroScale },
			],
			opacity: heroScale,
		}),
		[heroScale],
	)

	useEffect(() => {
		if (isActive) {
			setShowHero(true)
		}

		Animated.parallel([
			Animated.spring(markerScale, {
				toValue: isActive ? 0.35 : 1,
				useNativeDriver: true,
				friction: 6,
				tension: 160,
			}),
			Animated.spring(heroScale, {
				toValue: isActive ? 1 : 0,
				useNativeDriver: true,
				friction: 7,
				tension: 170,
			}),
		]).start(() => {
			if (!isActive) {
				setShowHero(false)
			}
		})
	}, [isActive])

	return (
		<>
			<MarkerView
				coordinate={[longitude, latitude]}
				anchor={{ x: 0.5, y: 0.5 }}
				allowOverlap={true}
			>
				<Pressable onPress={() => onPress?.(point)}>
					<Animated.View
						className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white"
						style={[{ backgroundColor: color }, markerAnimatedStyle]}
					>
						{!isActive && (
							<HugeiconsIcon
								icon={IconComponent}
								size={BIN_MARKER_ICON_SIZE}
								color="white"
								strokeWidth={1.5}
							/>
						)}
					</Animated.View>
				</Pressable>
			</MarkerView>

			{showHero && (
				<MarkerView
					coordinate={[longitude, latitude]}
					anchor={{ x: 0.5, y: 0.5 }}
					allowOverlap={true}
				>
					<Pressable onPress={() => onPress?.(point)}>
						<Animated.View className="items-center" style={heroAnimatedStyle}>
							<Animated.View
								className={`flex h-${HERO_MARKER_SIZE / 4} w-${HERO_MARKER_SIZE / 4} items-center justify-center rounded-full`}
								style={{
									backgroundColor: color,
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
									width: 8,
									height: 8,
									backgroundColor: color,
									transform: [{ rotate: '45deg' }],
									marginTop: HERO_MARKER_TRIANGLE_MARGIN_TOP,
									marginBottom: HERO_MARKER_TRIANGLE_MARGIN_BOTTOM,
								}}
							/>
						</Animated.View>
					</Pressable>
				</MarkerView>
			)}
		</>
	)
}

export default BinMarker
