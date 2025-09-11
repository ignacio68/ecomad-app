import { httpClient } from '../httpClient'

export const getAllClothingContainers = async () => {
	const response = await httpClient.get('/api/clothing-bins')
	return response
}

export const getClothingContainerByDistrict = async (district: string) => {
	const response = await httpClient.get(
		`/api/clothing-bins/district/${district}`,
	)
	return response
}

export const getClothingContainerByNearby = async (
	latitude: number,
	longitude: number,
	radius: number = 1,
) => {
	const response = await httpClient.get(
		`/api/clothing-bins/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`,
	)
	return response
}
