import { Pressable, Text, View } from 'react-native'
import { filteredPointsByNearby } from '@map/services/binsLoader'

const NearbyButton = ({
}) => {
	const handleNearby = async () => {
	// await filteredPointsByNearby(points, center, maxDistance)

  console.log('🔍 [NEARBY] Nearby button pressed')

	}

  return (
    <View className="flex-1 items-center justify-center mb-4">
		<Pressable
			onPress={handleNearby}
			className="rounded-full bg-secondary px-4 py-3 w-full"
		>
			<Text className="text-white font-lato-semibold text-base text-center">
				{`Cerca de mí`}
			</Text>
		</Pressable>

    </View>
  )
}

export default NearbyButton