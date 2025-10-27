import * as Location from 'expo-location'
import { PermissionStatus } from 'expo-location'

export interface UserLocation {
	latitude: number
	longitude: number
	accuracy?: number
	heading?: number
	speed?: number
	timestamp: number
}

export interface LocationOptions {
	accuracy?: Location.Accuracy
	timeInterval?: number
	distanceInterval?: number
}

/**
 * Servicio centralizado para gestión de geolocalización del usuario
 */
export class UserLocationService {
	private static instance: UserLocationService
	private watchSubscription: Location.LocationSubscription | null = null
	private currentLocation: UserLocation | null = null
	private readonly listeners: Set<(location: UserLocation) => void> = new Set()

	private constructor() {}

	static getInstance(): UserLocationService {
		if (!UserLocationService.instance) {
			UserLocationService.instance = new UserLocationService()
		}
		return UserLocationService.instance
	}

	/**
	 * Solicitar permisos de ubicación
	 */
	async requestPermissions(): Promise<PermissionStatus> {
		try {
			const { status } = await Location.requestForegroundPermissionsAsync()

			if (status === PermissionStatus.GRANTED) {
				// También solicitar permisos de ubicación en segundo plano para mejor precisión
				await Location.requestBackgroundPermissionsAsync()
				return PermissionStatus.GRANTED
			}

			return PermissionStatus.DENIED
		} catch (error) {
			console.error('❌ Error requesting location permissions:', error)
			return PermissionStatus.DENIED
		}
	}

	/**
	 * Verificar si los permisos están concedidos
	 */
	async checkPermissions(): Promise<PermissionStatus> {
		try {
			const { status } = await Location.getForegroundPermissionsAsync()
			return status === PermissionStatus.GRANTED
				? PermissionStatus.GRANTED
				: PermissionStatus.DENIED
		} catch (error) {
			console.error('❌ Error checking location permissions:', error)
			return PermissionStatus.DENIED
		}
	}

	/**
	 * Obtener ubicación actual una sola vez
	 */
	async getCurrentLocation(
		options?: LocationOptions,
	): Promise<UserLocation | null> {
		try {
			const permissionStatus = await this.checkPermissions()
			if (permissionStatus !== PermissionStatus.GRANTED) {
				console.warn('⚠️ Location permissions not granted')
				return null
			}

			const location = await Location.getCurrentPositionAsync({
				accuracy: options?.accuracy || Location.Accuracy.Balanced,
				timeInterval: options?.timeInterval || 2000,
				distanceInterval: options?.distanceInterval || 5,
			})

			const userLocation: UserLocation = {
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
				accuracy: location.coords.accuracy || undefined,
				heading: location.coords.heading || undefined,
				speed: location.coords.speed || undefined,
				timestamp: location.timestamp,
			}

			this.currentLocation = userLocation
			return userLocation
		} catch (error) {
			console.error('❌ Error getting current location:', error)
			return null
		}
	}

	/**
	 * Iniciar seguimiento continuo de ubicación
	 */
	async startLocationTracking(
		options?: LocationOptions,
		onLocationUpdate?: (location: UserLocation) => void,
	): Promise<boolean> {
		try {
			// Detener seguimiento anterior si existe
			await this.stopLocationTracking()

			const permissionStatus = await this.checkPermissions()
			if (permissionStatus !== PermissionStatus.GRANTED) {
				console.warn('⚠️ Location permissions not granted')
				return false
			}

			// Agregar listener si se proporciona
			if (onLocationUpdate) {
				this.addLocationListener(onLocationUpdate)
			}

			this.watchSubscription = await Location.watchPositionAsync(
				{
					accuracy: options?.accuracy || Location.Accuracy.Balanced,
					timeInterval: options?.timeInterval || 3000,
					distanceInterval: options?.distanceInterval || 10,
				},
				location => {
					// Filtrar ubicaciones con precisión muy baja (> 50 metros)
					if (location.coords.accuracy && location.coords.accuracy > 50) {
						console.warn(
							`⚠️ GPS accuracy too low: ${location.coords.accuracy}m, ignoring update`,
						)
						return
					}

					const userLocation: UserLocation = {
						latitude: location.coords.latitude,
						longitude: location.coords.longitude,
						accuracy: location.coords.accuracy || undefined,
						heading: location.coords.heading || undefined,
						speed: location.coords.speed || undefined,
						timestamp: location.timestamp,
					}

					this.currentLocation = userLocation
					this.notifyListeners(userLocation)
				},
			)

			console.log('✅ Location tracking started')
			return true
		} catch (error) {
			console.error('❌ Error starting location tracking:', error)
			return false
		}
	}

	/**
	 * Detener seguimiento de ubicación
	 */
	async stopLocationTracking(): Promise<void> {
		try {
			if (this.watchSubscription) {
				this.watchSubscription.remove()
				this.watchSubscription = null
			}
			console.log('✅ Location tracking stopped')
		} catch (error) {
			console.error('❌ Error stopping location tracking:', error)
		}
	}

	/**
	 * Obtener ubicación actual (desde cache o GPS)
	 */
	getLastKnownLocation(): UserLocation | null {
		return this.currentLocation
	}

	/**
	 * Agregar listener para cambios de ubicación
	 */
	addLocationListener(listener: (location: UserLocation) => void): void {
		this.listeners.add(listener)
	}

	/**
	 * Remover listener
	 */
	removeLocationListener(listener: (location: UserLocation) => void): void {
		this.listeners.delete(listener)
	}

	/**
	 * Notificar a todos los listeners
	 */
	private notifyListeners(location: UserLocation): void {
		this.listeners.forEach(listener => {
			try {
				listener(location)
			} catch (error) {
				console.error('❌ Error in location listener:', error)
			}
		})
	}

	/**
	 * Limpiar recursos
	 */
	async cleanup(): Promise<void> {
		await this.stopLocationTracking()
		this.listeners.clear()
		this.currentLocation = null
	}
}

// Instancia singleton
export const userLocationService = UserLocationService.getInstance()

// Funciones de conveniencia
export const requestLocationPermission = () =>
	userLocationService.requestPermissions()
export const getCurrentLocation = (options?: LocationOptions) =>
	userLocationService.getCurrentLocation(options)
export const startLocationTracking = (
	options?: LocationOptions,
	onUpdate?: (location: UserLocation) => void,
) => userLocationService.startLocationTracking(options, onUpdate)
export const stopLocationTracking = () =>
	userLocationService.stopLocationTracking()
export const getLastKnownLocation = () =>
	userLocationService.getLastKnownLocation()
