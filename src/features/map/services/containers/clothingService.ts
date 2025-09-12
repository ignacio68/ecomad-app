import {
	getAllClothingBins,
	getClothingContainerByDistrict,
	getClothingContainerByNearby,
} from '@/shared/services/api/bins/clothingApi'

export const getAllClothingBinsService = async () => {
	try {
		const response = await getAllClothingBins()
		if (response.success) {
			console.log('Clothes bins success')
			console.table(response.data)
			return response.data
		}

		if (response.statusCode === 500) {
			throw new Error('Error al obtener los contenedores de ropa')
		}
	} catch (error) {
		console.error(`Clothes bins error: ${error}`)
		throw error
	}
	return []
}

export const getClothingContainerByDistrictService = async (
	district: string,
) => {
	try {
		const response = await getClothingContainerByDistrict(district)
		if (response.success) {
			return response.data
		}

		if (response.statusCode === 400) {
			throw new Error(
				'Error al obtener los contenedores de ropa. Faltan parámetros requeridos',
			)
		}

		if (response.statusCode === 500) {
			throw new Error('Error al obtener los contenedores de ropa')
		}
	} catch (error) {
		console.error(`Clothes bins error: ${error}`)
		throw error
	}
	return []
}

export const getClothingContainerByNearbyService = async (
	latitude: number,
	longitude: number,
	radius: number = 1,
) => {
	const response = await getClothingContainerByNearby(
		latitude,
		longitude,
		radius,
	)
	if (response.success) {
		return response.data
	}

	if (response.statusCode === 400) {
		throw new Error(
			'Error al obtener los contenedores de ropa. Faltan parámetros requeridos',
		)
	}

	if (response.statusCode === 500) {
		throw new Error('Error al obtener los contenedores de ropa')
	}

	return []
}
