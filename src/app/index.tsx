import { Redirect } from "expo-router";
import { View } from "react-native";

export default function Index() {
  return (
    <View>
      <Redirect href="/map" />
    </View>
  );
} 