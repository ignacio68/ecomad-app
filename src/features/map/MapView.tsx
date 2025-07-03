import { View, Text } from "react-native";
import { useEffect } from "react";

const MapView = () => {
	useEffect(() => {
		console.log("MapView");
	}, []);
	return (
		<View className="flex-1 items-center justify-center bg-quaternary">
			<Text className="text-red-500 font-lato-bold text-3xl">Map</Text>
		</View>
	)
}

export default MapView;