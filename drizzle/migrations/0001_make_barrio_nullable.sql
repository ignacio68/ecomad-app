-- Migración para hacer el campo barrio nullable en bins_hierarchy_cache
-- Necesario para soportar bins sin neighborhood_code (como oil_bins)

-- SQLite no soporta ALTER COLUMN, así que necesitamos recrear la tabla
DROP TABLE IF EXISTS `bins_hierarchy_cache`;
--> statement-breakpoint
CREATE TABLE `bins_hierarchy_cache` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bin_type` text NOT NULL,
	`distrito` text NOT NULL,
	`barrio` text,
	`count` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);

