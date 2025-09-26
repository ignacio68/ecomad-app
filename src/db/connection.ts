import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite'

// Configuración de la base de datos
const DB_NAME = 'ecomad_cache.db'

// Crear conexión a SQLite
const sqlite = openDatabaseSync(DB_NAME)

// Crear instancia de Drizzle
export const db = drizzle(sqlite)
export { sqlite }
