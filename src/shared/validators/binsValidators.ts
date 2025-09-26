import { z } from 'zod'

export const binSchema = z.object({
	id: z.number(),
	tipo_dato: z.string(),
	lote: z.string(),
	cod_dist: z.string(),
	distrito: z.string(),
	cod_barrio: z.string(),
	barrio: z.string(),
	direccion_completa: z.string(),
	via_clase: z.string(),
	via_par: z.string(),
	via_nombre: z.string(),
	tipo_numero: z.string(),
	numero: z.string(),
	latitud: z.number(),
	longitud: z.number(),
	direccion_completa_ampliada: z.string(),
	mas_informacion: z.string(),
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
