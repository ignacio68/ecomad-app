import { Redirect } from 'expo-router'
import {
	configureReanimatedLogger,
	ReanimatedLogLevel,
} from 'react-native-reanimated'

configureReanimatedLogger({
	level: ReanimatedLogLevel.error,
	strict: false,
})

const Home = () => {
	return <Redirect href="/(app)/map" />
}

export default Home