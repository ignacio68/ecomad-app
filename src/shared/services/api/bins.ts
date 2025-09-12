import { z } from 'zod'
import { httpClient } from './httpClient'

// Esquemas Zod
export const ClothingBinSchema = z.object({
	'TIPO_DATO': z.string(),
	'LOTE': z.number().or(z.string()),
	'COD_DIST': z.number().or(z.string()),
	'DISTRITO': z.string(),
	'COD_BARRIO': z.number().or(z.string()),
	'BARRIO': z.string(),
	'DIRECCION_COMPLETA': z.string(),
	'VIA_CLASE': z.string(),
	'VIA_PAR': z.string(),
	'VIA_NOMBRE': z.string(),
	'TIPO_NUMERO': z.string(),
	'NUMERO': z.string(),
	'LATITUD': z.number(),
	'LONGITUD': z.number(),
	'DIRECCIÓN COMPLETA AMPLIADA': z.string(),
	'MÁS INFORMACIÓN': z.string(),
})

export const ClothingBinsResponseSchema = z.array(ClothingBinSchema)

export const DistrictAggregateSchema = z.object({
	distrito: z.string(),
	count: z.number(),
	centroid: z.object({ lat: z.number(), lng: z.number() }),
})
export const NeighborhoodAggregateSchema = z.object({
	distrito: z.string(),
	barrio: z.string(),
	count: z.number(),
	centroid: z.object({ lat: z.number(), lng: z.number() }),
})
export const DistrictAggregatesResponseSchema = z.array(DistrictAggregateSchema)
export const NeighborhoodAggregatesResponseSchema = z.array(
	NeighborhoodAggregateSchema,
)

interface NearByCoordinates {
	latitude: number
	longitude: number
	radius: number
}

export const getAllClothingBins = async (endPoint: string) => {
	const response = await httpClient.get(`/api/${endPoint}`)
	return response
}

export const getClothingContainerByDistrict = async (
	endPoint: string,
	district: string,
) => {
	const response = await httpClient.get(`/api/${endPoint}/district/${district}`)
	return response
}

export const getClothingContainerByNearby = async (
	endPoint: string,
	coordinates: NearByCoordinates,
) => {
	const response = await httpClient.get(
		`/api/${endPoint}/nearby?lat=${coordinates.latitude}&lng=${coordinates.longitude}&radius=${coordinates.radius}`,
	)
	return response
}

// Nuevos métodos para conteos directos (sin filtrar por bounds)
export const getClothingBinsCountByDistrict = async () => {
	const response = await httpClient.get('/api/clothing-bins/counts/district')
	return response
}

export const getClothingBinsCountByNeighborhood = async () => {
	const response = await httpClient.get(
		'/api/clothing-bins/counts/neighborhood',
	)
	return response
}
