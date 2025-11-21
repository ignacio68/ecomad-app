import { Pressable, Text, View } from 'react-native'

const NearbyButton = ({}) => {
	const handleNearby = async () => {
		// await filteredPointsByNearby(points, center, maxDistance)
	}

	return (
		<View className="mb-4 flex-1 items-center justify-center">
			<Pressable
				onPress={handleNearby}
				className="w-full rounded-full bg-secondary px-4 py-3"
			>
				<Text className="text-center font-lato-semibold text-base text-white">
					{`Cerca de mí`}
				</Text>
			</Pressable>
		</View>
	)
}

export default NearbyButton
