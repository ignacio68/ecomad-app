// Jest setup file para manejar mocks de Expo
// Este archivo resuelve el problema con 'expo/src/async-require/messageSocket'

// Mock para expo/src/async-require/messageSocket
jest.mock(
	'expo/src/async-require/messageSocket',
	() => ({
		default: {
			send: jest.fn(),
			on: jest.fn(),
			off: jest.fn(),
			connect: jest.fn(),
			disconnect: jest.fn(),
		},
	}),
	{ virtual: true },
)

// Mock adicional para react-native/Libraries/Core/Devtools/getDevServer
jest.mock(
	'react-native/Libraries/Core/Devtools/getDevServer',
	() => ({
		getDevServer: jest.fn(() => ({
			url: 'http://localhost:8081',
			bundleLoadedFromServer: true,
		})),
	}),
	{ virtual: true },
)

// Mock para console.warn para evitar warnings en los tests
const originalWarn = console.warn
beforeAll(() => {
	console.warn = (...args) => {
		if (
			typeof args[0] === 'string' &&
			args[0].includes('Warning: ReactDOM.render is deprecated')
		) {
			return
		}
		originalWarn.call(console, ...args)
	}
})

afterAll(() => {
	console.warn = originalWarn
})
