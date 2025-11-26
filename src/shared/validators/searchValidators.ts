import { z } from 'zod'

const DistrictAggregateSchema = z.object({
	distrito: z.string(),
	count: z.number(),
	centroid: z.object({ lat: z.number(), lng: z.number() }),
})

const NeighborhoodAggregateSchema = z.object({
	distrito: z.string(),
	barrio: z.string(),
	count: z.number(),
	centroid: z.object({ lat: z.number(), lng: z.number() }),
})

export const DistrictAggregatesResponseSchema = z.array(DistrictAggregateSchema)

export const NeighborhoodAggregatesResponseSchema = z.array(
	NeighborhoodAggregateSchema,
)
