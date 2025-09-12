import {
	ClothingBinsResponseSchema,
	DistrictAggregatesResponseSchema,
	NeighborhoodAggregatesResponseSchema,
} from '../bins'
import { httpClient } from '../httpClient'

export const getAllClothingBins = async () => {
	const response = await httpClient.get('/api/clothing-bins')
	const parsed = ClothingBinsResponseSchema.safeParse(response.data)
	return { ...response, data: parsed.success ? parsed.data : [] }
}

export const getClothingContainerByDistrict = async (district: string) => {
	const response = await httpClient.get(
		`/api/clothing-bins/district/${district}`,
	)
	const parsed = ClothingBinsResponseSchema.safeParse(response.data)
	return { ...response, data: parsed.success ? parsed.data : [] }
}

export const getClothingContainerByNearby = async (
	latitude: number,
	longitude: number,
	radius: number = 1,
) => {
	const response = await httpClient.get(
		`/api/clothing-bins/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`,
	)
	const parsed = ClothingBinsResponseSchema.safeParse(response.data)
	return { ...response, data: parsed.success ? parsed.data : [] }
}

export const getClothingBinsAggregateByDistrict = async (
	minLat: number,
	minLng: number,
	maxLat: number,
	maxLng: number,
) => {
	const response = await httpClient.get(
		`/api/clothing-bins/aggregate/district?minLat=${minLat}&minLng=${minLng}&maxLat=${maxLat}&maxLng=${maxLng}`,
	)
	const parsed = DistrictAggregatesResponseSchema.safeParse(response.data)
	return { ...response, data: parsed.success ? parsed.data : [] }
}

export const getClothingBinsAggregateByNeighborhood = async (
	minLat: number,
	minLng: number,
	maxLat: number,
	maxLng: number,
) => {
	const response = await httpClient.get(
		`/api/clothing-bins/aggregate/neighborhood?minLat=${minLat}&minLng=${minLng}&maxLat=${maxLat}&maxLng=${maxLng}`,
	)
	const parsed = NeighborhoodAggregatesResponseSchema.safeParse(response.data)
	return { ...response, data: parsed.success ? parsed.data : [] }
}

// Nuevos métodos para conteos directos (sin filtrar por bounds)
export const getClothingBinsCountByDistrict = async () => {
	const response = await httpClient.get('/api/clothing-bins/counts/district')
	const parsed = DistrictAggregatesResponseSchema.safeParse(response.data)
	return { ...response, data: parsed.success ? parsed.data : [] }
}

export const getClothingBinsCountByNeighborhood = async () => {
	const response = await httpClient.get(
		'/api/clothing-bins/counts/neighborhood',
	)
	const parsed = NeighborhoodAggregatesResponseSchema.safeParse(response.data)
	return { ...response, data: parsed.success ? parsed.data : [] }
}
