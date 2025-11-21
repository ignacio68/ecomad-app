import { Redirect } from 'expo-router'
import {
	configureReanimatedLogger,
	ReanimatedLogLevel,
} from 'react-native-reanimated'


configureReanimatedLogger({
	level: ReanimatedLogLevel.error,
	strict: false,
})

if (!__DEV__) {
	const noop = () => {}
	console.log = noop
	console.debug = noop
	// deja console.warn/error si quieres mantener avisos críticos
}

const Home = () => {

	return <Redirect href="/(app)/map" />
}

export default Home