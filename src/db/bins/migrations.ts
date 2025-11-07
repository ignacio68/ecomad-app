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
	// Migración 2: Actualizar estructura de bins_containers_cache
	`
	-- Eliminar tabla antigua si existe (empezar desde cero)
	DROP TABLE IF EXISTS bins_containers_cache;
	`,
	`
	-- Crear nueva tabla con estructura actualizada (todos los campos del backend)
	CREATE TABLE IF NOT EXISTS bins_containers_cache (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		bin_type TEXT NOT NULL,
		container_id TEXT NOT NULL,
		category_group_id INTEGER NOT NULL,
		category_id INTEGER NOT NULL,
		district_id INTEGER NOT NULL,
		neighborhood_id INTEGER,
		address TEXT NOT NULL,
		lat REAL NOT NULL,
		lng REAL NOT NULL,
		load_type TEXT,
		direction TEXT,
		subtype TEXT,
		placement_type TEXT,
		notes TEXT,
		bus_stop TEXT,
		interurban_node TEXT,
		created_at INTEGER NOT NULL,
		updated_at INTEGER NOT NULL
	);
	`,
	// Migración 3: Cambiar district_id y neighborhood_id a códigos (TEXT)
	`
	-- Eliminar tabla antigua (Schema v2: códigos en lugar de IDs)
	DROP TABLE IF EXISTS bins_containers_cache;
	`,
	`
	-- Crear tabla con códigos (TEXT) en lugar de IDs (INTEGER)
	CREATE TABLE IF NOT EXISTS bins_containers_cache (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		bin_type TEXT NOT NULL,
		container_id TEXT NOT NULL,
		category_group_id INTEGER NOT NULL,
		category_id INTEGER NOT NULL,
		district_code TEXT NOT NULL,
		neighborhood_code TEXT,
		address TEXT NOT NULL,
		lat REAL NOT NULL,
		lng REAL NOT NULL,
		load_type TEXT,
		direction TEXT,
		subtype TEXT,
		placement_type TEXT,
		notes TEXT,
		bus_stop TEXT,
		interurban_node TEXT,
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
