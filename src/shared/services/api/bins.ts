import { BinType, LocationType } from '@/shared/types/bins'
import { NearByCoordinates } from '@/shared/types/search'
import { normalizeLocationName } from '@/shared/utils/locationsUtils'
import {
	binsNearbyApiResponseSchema,
	binsResponseSchema,
} from '@/shared/validators/binsValidators'
import { z } from 'zod'
import { httpClient } from './httpClient'

// URL base para la API de bins desde variables de entorno
const BINS_BASE_URL = process.env.EXPO_PUBLIC_API_BINS_BASE_URL as string

// Schema para conteos jerárquicos (ahora usa IDs)
const hierarchyCountSchema = z.object({
	distrito: z.string(), // ID del distrito (1-35)
	barrio: z.string(), // ID del barrio (1-218)
	count: z.number(),
})

const hierarchyCountsResponseSchema = z.array(hierarchyCountSchema)

// Schema para la respuesta completa del endpoint /counts
const hierarchyCountsApiResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
	statusCode: z.number(),
	responseObject: z.array(hierarchyCountSchema),
})

export const getAllBins = async (binType: BinType) => {
	const response = await httpClient.get(`${BINS_BASE_URL}/${binType}`)
	const parsed = binsNearbyApiResponseSchema.safeParse(response.data)

	if (parsed.success) {
		return { ...response, data: parsed.data.responseObject }
	} else {
		console.error(`❌ getAllBins failed to parse for ${binType}:`, parsed.error)
		return { ...response, data: [] }
	}
}

export const getBinsByLocation = async (
	binType: BinType,
	locationType: LocationType,
	locationValue: string,
	options?: { page?: number; limit?: number },
) => {
	// Normalizar el nombre de ubicación (elimina espacios, acentos y convierte a mayúsculas)
	const normalizedLocationValue = normalizeLocationName(locationValue)

	const params = new URLSearchParams()
	if (options?.page) params.append('page', options.page.toString())
	if (options?.limit) params.append('limit', options.limit.toString())

	const queryString = params.toString()
	const baseUrl = `${BINS_BASE_URL}/${binType}/location/${locationType}/${normalizedLocationValue}`
	const url = queryString ? `${baseUrl}?${queryString}` : baseUrl

	const response = await httpClient.get(url)
	const parsed = binsResponseSchema.safeParse(response.data)
	return { ...response, data: parsed.success ? parsed.data : [] }
}

export const getBinsByNearby = async (
	binType: BinType,
	coordinates: NearByCoordinates,
	limit?: number,
) => {
	const params = new URLSearchParams()
	params.append('lat', coordinates.latitude.toString())
	params.append('lng', coordinates.longitude.toString())
	params.append('radius', coordinates.radius.toString())
	if (limit !== undefined) {
		params.append('limit', limit.toString())
	}

	const response = await httpClient.get(
		`${BINS_BASE_URL}/${binType}/nearby?${params.toString()}`,
	)
	const parsed = binsNearbyApiResponseSchema.safeParse(response.data)

	if (parsed.success) {
		return { ...response, data: parsed.data.responseObject }
	} else {
		console.error('❌ Failed to parse nearby response:', parsed.error)
		return { ...response, data: [] }
	}
}

const binsCountResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
	responseObject: z.object({
		count: z.number(),
	}),
	statusCode: z.number(),
})

export const getBinsCount = async (binType: BinType) => {
	const response = await httpClient.get(`${BINS_BASE_URL}/${binType}/count`)
	const parsed = binsCountResponseSchema.safeParse(response.data)

	if (parsed.success) {
		return { ...response, data: parsed.data }
	} else {
		console.error('❌ Failed to parse count response:', parsed.error)
		return {
			...response,
			data: {
				success: false,
				message: '',
				responseObject: { count: 0 },
				statusCode: 0,
			},
		}
	}
}

export const getBinsCountsHierarchy = async (binType: BinType) => {
	const response = await httpClient.get(`${BINS_BASE_URL}/${binType}/counts`)
	const parsed = hierarchyCountsApiResponseSchema.safeParse(response.data)

	if (parsed.success) {
		return { ...response, data: parsed.data.responseObject }
	} else {
		console.error('❌ Failed to parse hierarchy response:', parsed.error)
		return { ...response, data: [] }
	}
}
