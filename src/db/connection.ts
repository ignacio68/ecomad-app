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

console.log('🗄️ SQLite database opened with WAL mode')

// Crear instancia de Drizzle
export const db = drizzle(sqlite)
export { sqlite }
