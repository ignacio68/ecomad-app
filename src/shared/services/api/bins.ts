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
const BINS_BASE_URL =
	process.env.EXPO_PUBLIC_API_BINS_BASE_URL as string

// Schema para conteos jerárquicos
const hierarchyCountSchema = z.object({
	distrito: z.string(),
	barrio: z.string(),
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
	console.log(`🔍 getAllBins called for ${binType}`)
	const response = await httpClient.get(`${BINS_BASE_URL}/${binType}`)

	// // Debug: ver la estructura exacta de la respuesta
	// console.log(
	// 	`🔍 getAllBins raw response.data:`,
	// 	JSON.stringify(response.data, null, 2),
	// )

	// Usar la misma lógica que getBinsByNearby - el backend devuelve ServiceResponse
	const parsed = binsNearbyApiResponseSchema.safeParse(response.data)

	if (parsed.success) {
		console.log(`✅ getAllBins parsed successfully for ${binType}:`, {
			dataLength: parsed.data.responseObject.length,
			firstItem: parsed.data.responseObject[0] || null,
		})
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
) => {
	const response = await httpClient.get(
		`${BINS_BASE_URL}/${binType}/nearby?lat=${coordinates.latitude}&lng=${coordinates.longitude}&radius=${coordinates.radius}`,
	)
	const parsed = binsNearbyApiResponseSchema.safeParse(response.data)

	if (parsed.success) {
		return { ...response, data: parsed.data.responseObject }
	} else {
		console.error('❌ Failed to parse nearby response:', parsed.error)
		return { ...response, data: [] }
	}
}

export const getBinsCount = async (binType: BinType) => {
	const response = await httpClient.get(`${BINS_BASE_URL}/${binType}/count`)
	return response
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
