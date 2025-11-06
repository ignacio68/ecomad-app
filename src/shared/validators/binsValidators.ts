import { z } from 'zod'

// Schema actualizado para coincidir con la estructura del backend
export const binSchema = z.object({
	id: z.number(),
	category_group_id: z.number(),
	category_id: z.number(),
	district_id: z.number(),
	neighborhood_id: z.number().nullable(),
	address: z.string(),
	lat: z.number(),
	lng: z.number(),
	load_type: z.string().nullable(),
	direction: z.string().nullable(),
	subtype: z.string().nullable(),
	placement_type: z.string().nullable(),
	notes: z.string().nullable(),
	bus_stop: z.string().nullable(),
	interurban_node: z.string().nullable(),
	created_at: z.string(),
	updated_at: z.string(),
})

export const binsResponseSchema = z.array(binSchema)

// Schema para la respuesta completa del endpoint /nearby
export const binsNearbyApiResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
	statusCode: z.number(),
	responseObject: z.array(binSchema),
})
