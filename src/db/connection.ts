import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite'
// import { useDrizzleStudio } from 'expo-drizzle-studio-plugin'

// Configuración de la base de datos
const DB_NAME = 'ecomad_cache.db'

// Crear conexión a SQLite con WAL mode
const sqlite = openDatabaseSync(DB_NAME)
// useDrizzleStudio(sqlite )

// Habilitar WAL mode para mejor performance y concurrencia
// https://www.sqlite.org/wal.html
sqlite.execSync('PRAGMA journal_mode = WAL;')
sqlite.execSync('PRAGMA synchronous = NORMAL;')
sqlite.execSync('PRAGMA temp_store = MEMORY;')
sqlite.execSync('PRAGMA mmap_size = 30000000000;')

const ensureSpatialIndexes = () => {
	try {
		sqlite.execSync(
			'CREATE INDEX IF NOT EXISTS idx_bins_containers_bounds ON bins_containers_cache (bin_type, lat, lng);',
		)
		sqlite.execSync(
			'CREATE INDEX IF NOT EXISTS idx_bins_containers_geo ON bins_containers_cache (bin_type, district_code, neighborhood_code);',
		)
		console.log('🗄️ SQLite spatial indexes ensured')
	} catch (error) {
		console.warn(
			'⚠️ Unable to ensure SQLite indexes (likely before migrations)',
			{
				error,
			},
		)
	}
}

ensureSpatialIndexes()

console.log('🗄️ SQLite database opened with WAL mode')

// Crear instancia de Drizzle
export const db = drizzle(sqlite)
export { sqlite }
