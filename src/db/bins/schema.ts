import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// Tabla para cache de conteos jerárquicos de bins (distritos/barrios)
export const binsHierarchyCache = sqliteTable('bins_hierarchy_cache', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	binType: text('bin_type', {
		enum: [
			'clothing_bins',
			'oil_bins',
			'glass_bins',
			'paper_bins',
			'plastic_bins',
			'organic_bins',
			'battery_bins',
			'other_bins',
		],
	}).notNull(),
	distrito: text('distrito').notNull(),
	barrio: text('barrio'), // Nullable porque algunos bins no tienen neighborhood_code
	count: integer('count').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
})

// Tabla para cache de conteos totales de bins
export const binsTotalCountCache = sqliteTable('bins_total_count_cache', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	binType: text('bin_type', {
		enum: [
			'clothing_bins',
			'oil_bins',
			'glass_bins',
			'paper_bins',
			'plastic_bins',
			'organic_bins',
			'battery_bins',
			'other_bins',
		],
	})
		.notNull()
		.unique(),
	totalCount: integer('total_count').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
})

// Tabla para cache de datos de contenedores individuales de bins
export const binsContainersCache = sqliteTable('bins_containers_cache', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	binType: text('bin_type', {
		enum: [
			'clothing_bins',
			'oil_bins',
			'glass_bins',
			'paper_bins',
			'plastic_bins',
			'organic_bins',
			'battery_bins',
			'other_bins',
		],
	}).notNull(),
	containerId: text('container_id').notNull(), // ID del backend
	category_group_id: integer('category_group_id').notNull(),
	category_id: integer('category_id').notNull(),
	district_code: text('district_code').notNull(), // Cambiado de district_id a district_code
	neighborhood_code: text('neighborhood_code'), // Cambiado de neighborhood_id a neighborhood_code
	address: text('address').notNull(),
	lat: real('lat').notNull(),
	lng: real('lng').notNull(),
	load_type: text('load_type'), // Tipo de carga
	direction: text('direction'), // Dirección adicional
	subtype: text('subtype'), // Subtipo de contenedor
	placement_type: text('placement_type'), // Tipo de emplazamiento
	notes: text('notes'), // Notas adicionales
	bus_stop: text('bus_stop'), // Parada de bus (battery_bins)
	interurban_node: text('interurban_node'), // Nodo interurbano (battery_bins)
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
})

export type BinsHierarchyCacheRecord = typeof binsHierarchyCache.$inferSelect
export type BinsTotalCountCacheRecord = typeof binsTotalCountCache.$inferSelect
export type BinsContainersCacheRecord = typeof binsContainersCache.$inferSelect
