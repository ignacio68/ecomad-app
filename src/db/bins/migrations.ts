/**
 * Migraciones específicas para el módulo de bins
 */
export const binsMigrations = [
	// Migración 1: Crear tablas de bins
	`
	CREATE TABLE IF NOT EXISTS bins_hierarchy_cache (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		bin_type TEXT NOT NULL,
		distrito TEXT NOT NULL,
		barrio TEXT NOT NULL,
		count INTEGER NOT NULL,
		created_at INTEGER NOT NULL,
		updated_at INTEGER NOT NULL
	);
	`,
	`
	CREATE TABLE IF NOT EXISTS bins_total_count_cache (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		bin_type TEXT UNIQUE NOT NULL,
		total_count INTEGER NOT NULL,
		created_at INTEGER NOT NULL,
		updated_at INTEGER NOT NULL
	);
	`,
	`
	CREATE TABLE IF NOT EXISTS bins_containers_cache (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		bin_type TEXT NOT NULL,
		container_id TEXT NOT NULL,
		distrito TEXT NOT NULL,
		barrio TEXT NOT NULL,
		direccion TEXT NOT NULL,
		latitud REAL NOT NULL,
		longitud REAL NOT NULL,
		created_at INTEGER NOT NULL,
		updated_at INTEGER NOT NULL
	);
	`,
]

/**
 * Limpiar datos específicos de bins
 */
export const binsCleanupQueries = [
	'DELETE FROM bins_hierarchy_cache;',
	'DELETE FROM bins_total_count_cache;',
	'DELETE FROM bins_containers_cache;',
]

/**
 * Obtener información específica de bins
 */
export const binsInfoQueries = [
	'SELECT COUNT(*) as count FROM bins_hierarchy_cache',
	'SELECT COUNT(*) as count FROM bins_total_count_cache',
	'SELECT COUNT(*) as count FROM bins_containers_cache',
]
