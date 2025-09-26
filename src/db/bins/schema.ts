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
			'other_bins',
		],
	}).notNull(),
	distrito: text('distrito').notNull(),
	barrio: text('barrio').notNull(),
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
			'other_bins',
		],
	}).notNull(),
	containerId: text('container_id').notNull(),
	distrito: text('distrito').notNull(),
	barrio: text('barrio').notNull(),
	direccion: text('direccion').notNull(),
	latitud: real('latitud').notNull(),
	longitud: real('longitud').notNull(),
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
