import { BinType } from '@/shared/types/bins'
import { BIN_MARKER_ICONS } from '@map/constants/binMarkerIcons'
// TODO: MarkerView comentado temporalmente - no compatible con Nueva Arquitectura (Fabric)
// import { MarkerView } from '@rnmapbox/maps'
import React, { useEffect, useMemo, useRef } from 'react'
import { Animated } from 'react-native'

interface BinMarkerProps {
	point: any
	onPress?: (point: any) => void
	isActive?: boolean
}

const BinMarker: React.FC<BinMarkerProps> = ({ point, onPress, isActive }) => {
	const { binType } = point.properties
	const [longitude, latitude] = point.geometry.coordinates

	const { color, default: DefaultIcon } = BIN_MARKER_ICONS[binType as BinType]

	const markerScale = useRef(new Animated.Value(1)).current

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

	useEffect(() => {
		Animated.spring(markerScale, {
			toValue: isActive ? 0.35 : 1,
			useNativeDriver: true,
			friction: 6,
			tension: 160,
		}).start()
	}, [isActive, markerScale])

	const handleBinMarkerPress = () => onPress?.(point)

	// TODO: MarkerView comentado temporalmente - no compatible con Nueva Arquitectura (Fabric)
	// Usar MapBinMarker o ShapeSource en su lugar
	return null
	// return (
	// 	<MarkerView coordinate={[longitude, latitude]} anchor={{ x: 0.5, y: 0.5 }}>
	// 		<Pressable onPress={handleBinMarkerPress}>
	// 			<Animated.View
	// 				className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white"
	// 				style={[{ backgroundColor: color }, markerAnimatedStyle]}
	// 			>
	// 				{!isActive && (
	// 					<HugeiconsIcon
	// 						icon={DefaultIcon}
	// 						size={BIN_MARKER_ICON_SIZE}
	// 						color="white"
	// 						strokeWidth={1.5}
	// 					/>
	// 				)}
	// 			</Animated.View>
	// 		</Pressable>
	// 	</MarkerView>
	// )
}

export default BinMarker
