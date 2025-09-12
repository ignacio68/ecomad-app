// src/stores/location.ts
import { create } from 'zustand'
import * as Location from 'expo-location'
import type { LocationSubscription } from 'expo-location'

interface Coords {
	longitude: number
	latitude: number
}

type LocationState = {
	// estado
	granted: boolean | null
	error: string | null
	location: Coords | null
	isRunning: boolean

	// opciones
	accuracy: Location.LocationAccuracy
	timeInterval: number // ms
	distanceInterval: number // metros

	// control interno
	_sub: LocationSubscription | null

	// acciones
	setPermissions: (mayPrompt?: boolean) => Promise<boolean>
	getCurrentPosition: (
		accuracyOverride?: Location.LocationAccuracy,
	) => Promise<Location.LocationObject | null>
	startWatching: (
		opts?: Partial<
			Pick<LocationState, 'accuracy' | 'timeInterval' | 'distanceInterval'>
		>,
	) => Promise<void>
	stopWatching: () => void

	setOptions: (
		opts: Partial<
			Pick<LocationState, 'accuracy' | 'timeInterval' | 'distanceInterval'>
		>,
	) => void
	resetError: () => void
}

export const useLocationStore = create<LocationState>((set, get) => ({
	granted: null,
	error: null,
	location: null,
	isRunning: false,

	accuracy: Location.Accuracy.Balanced,
	timeInterval: 1000,
	distanceInterval: 5,

	_sub: null,

	setPermissions: async (mayPrompt = true) => {
		try {
			const { status } = await Location.getForegroundPermissionsAsync()
			if (status === 'granted') {
				set({ granted: true })
				return true
			}
			if (!mayPrompt) {
				set({ granted: false, error: 'Permiso de ubicación no concedido.' })
				return false
			}
			const req = await Location.requestForegroundPermissionsAsync()
			const ok = req.status === 'granted'
			set({ granted: ok, error: ok ? null : 'Permiso de ubicación denegado.' })
			return ok
		} catch (e: any) {
			set({
				granted: false,
				error: e?.message ?? 'Error al comprobar permisos.',
			})
			return false
		}
	},

	// Útil para “buscar cerca de mí” sin watch
	getCurrentPosition: async accuracyOverride => {
		const ok = await get().setPermissions(true)
		if (!ok) return null
		try {
			const acc = accuracyOverride ?? get().accuracy
			const loc = await Location.getCurrentPositionAsync({ accuracy: acc })
			set({ location: { longitude:loc.coords.longitude, latitude: loc.coords.latitude } })
			console.log('Ubicación actual:', location)
			return loc
		} catch (e: any) {
			set({ error: e?.message ?? 'No se pudo obtener la ubicación actual.' })
			return null
		}
	},

	// Watch continuo: actualiza `location` en cada fix
	startWatching: async opts => {
		const { _sub, isRunning, setPermissions } = get()
		if (isRunning && _sub) return

		if (opts) get().setOptions(opts)

		const ok = await setPermissions(true)
		if (!ok) return

		const { accuracy, timeInterval, distanceInterval } = get()

		// // primer fix rápido (opcional)
		// try {
		// 	const current = await Location.getCurrentPositionAsync({ accuracy })
		// 	set({ location: { longitude:current.coords.longitude, latitude: current.coords.latitude }  })
		// } catch {}

		try {
			const sub = await Location.watchPositionAsync(
				{ accuracy, timeInterval, distanceInterval },
				loc => {
					set({
						location: {
							longitude: loc.coords.longitude,
							latitude: loc.coords.latitude,
						},
					})
					console.log('watch::Ubicación actual:', location)
				}, // <-- aquí guardamos SIEMPRE la última posición
			)

			set({ _sub: sub, isRunning: true, error: null })
		} catch (e: any) {
			set({
				error: e?.message ?? 'No se pudo iniciar el seguimiento.',
				isRunning: false,
			})
		}
	},

	stopWatching: () => {
		const { _sub } = get()
		_sub?.remove()
		set({ _sub: null, isRunning: false })
	},

	setOptions: opts => set(s => ({ ...s, ...opts })),
	resetError: () => set({ error: null }),
}))
