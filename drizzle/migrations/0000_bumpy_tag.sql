CREATE TABLE `bins_containers_cache` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bin_type` text NOT NULL,
	`container_id` text NOT NULL,
	`category_group_id` integer NOT NULL,
	`category_id` integer NOT NULL,
	`district_code` text NOT NULL,
	`neighborhood_code` text,
	`address` text NOT NULL,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`load_type` text,
	`direction` text,
	`subtype` text,
	`placement_type` text,
	`notes` text,
	`bus_stop` text,
	`interurban_node` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
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
--> statement-breakpoint
CREATE TABLE `bins_total_count_cache` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bin_type` text NOT NULL,
	`total_count` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bins_total_count_cache_bin_type_unique` ON `bins_total_count_cache` (`bin_type`);