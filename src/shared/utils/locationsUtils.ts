import { DISTRICTS } from '@/shared/constants/districts'

/**
 * Utilidades para trabajar con distritos y barrios de Madrid
 */

// Tipos derivados de los datos
export type DistrictName = (typeof DISTRICTS)[number]['nom_dis']
export type NeighborhoodName =
	(typeof DISTRICTS)[number]['barrios'][number]['nom_bar']

/**
 * Obtiene todos los nombres de distritos
 */
export const getDistrictNames = (): DistrictName[] => {
	return DISTRICTS.map(district => district.nom_dis)
}

/**
 * Obtiene todos los nombres de barrios de un distrito específico
 */
export const getNeighborhoodNames = (
	districtName: DistrictName,
): NeighborhoodName[] => {
	const district = DISTRICTS.find(d => d.nom_dis === districtName)
	return district ? district.barrios.map(barrio => barrio.nom_bar) : []
}

/**
 * Obtiene las coordenadas de un distrito
 */
export const getDistrictCoordinates = (
	districtName: DistrictName,
): { lat: number; lng: number } | null => {
	const district = DISTRICTS.find(d => d.nom_dis === districtName)
	return district ? district.centroid : null
}

/**
 * Obtiene las coordenadas de un barrio
 */
export const getNeighborhoodCoordinates = (
	neighborhoodName: NeighborhoodName,
): { lat: number; lng: number } | null => {
	for (const district of DISTRICTS) {
		const neighborhood = district.barrios.find(
			b => b.nom_bar === neighborhoodName,
		)
		if (neighborhood) {
			return neighborhood.centroid
		}
	}
	return null
}

/**
 * Obtiene todos los barrios de todos los distritos
 */
export const getAllNeighborhoodNames = (): NeighborhoodName[] => {
	return DISTRICTS.flatMap(district =>
		district.barrios.map(barrio => barrio.nom_bar),
	)
}

/**
 * Normaliza un nombre de ubicación para usar con la API
 * - Elimina espacios en blanco al principio y al final
 * - Sustituye caracteres con acentos por los mismos sin acentuar
 * - Convierte a mayúsculas
 */
export const normalizeLocationName = (name: string): string => {
	// 1. Eliminar espacios en blanco al principio y al final
	const trimmed = name.trim()

	// 2. Sustituir caracteres con acentos por los mismos sin acentuar
	const withoutAccents = trimmed
		.normalize('NFD') // Descompone los caracteres acentuados
		.replace(/[\u0300-\u036f]/g, '') // Elimina los diacríticos (acentos)

	// 3. Convertir a mayúsculas
	return withoutAccents.toUpperCase()
}

/**
 * Convierte un nombre de distrito a formato normalizado para usar con la API
 */
export const normalizeDistrictName = (districtName: DistrictName): string => {
	return normalizeLocationName(districtName)
}

/**
 * Convierte un nombre de barrio a formato normalizado para usar con la API
 */
export const normalizeNeighborhoodName = (
	neighborhoodName: NeighborhoodName,
): string => {
	return normalizeLocationName(neighborhoodName)
}

/**
 * Valida si un nombre de distrito existe
 */
export const isValidDistrictName = (name: string): name is DistrictName => {
	return DISTRICTS.some(district => district.nom_dis === name)
}

/**
 * Valida si un nombre de barrio existe
 */
export const isValidNeighborhoodName = (
	name: string,
): name is NeighborhoodName => {
	return DISTRICTS.some(district =>
		district.barrios.some(barrio => barrio.nom_bar === name),
	)
}

/**
 * Obtiene el distrito al que pertenece un barrio
 */
export const getDistrictByNeighborhood = (
	neighborhoodName: NeighborhoodName,
): DistrictName | null => {
	const district = DISTRICTS.find(d =>
		d.barrios.some(barrio => barrio.nom_bar === neighborhoodName),
	)
	return district ? district.nom_dis : null
}

/**
 * Obtiene el nombre de un distrito por su ID (1-35)
 */
export const getDistrictNameById = (districtId: string): string => {
	console.log('🔍 [DEBUG] districtId:', districtId)
	const districtName = DISTRICTS.find(
		district => district.district_id === districtId.toString(),
	)
	console.log('🔍 [DEBUG] districtName:', districtName)
	return districtName ? districtName.nom_dis : `Distrito ${districtId}`
}

/**
 * Obtiene el nombre de un barrio por su código de barrio
 * El código de barrio es único en toda la ciudad (ej: 11, 12, 21, 101, etc.)
 */
export const getNeighborhoodNameById = (
	neighborhoodCode: string
): string => {
	const code = neighborhoodCode.toString()
	for (const district of DISTRICTS) {
		const neighborhood = district.barrios.find(
			neighborhood => neighborhood.neighborhood_id === code,
		)
		if (neighborhood) {
			return neighborhood.nom_bar
		}
	}
	return `Barrio ${code}`
}

/**
 * Obtiene el ID del distrito por su nombre
 */
export const getDistrictIdByName = (districtName: string): number | null => {
	const district = DISTRICTS.find(d => d.nom_dis === districtName)
	return district ? Number.parseInt(district.district_id) : null
}
