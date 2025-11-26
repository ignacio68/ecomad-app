import { sqlite } from './connection'
import { binsModule } from './bins'

// Sistema de módulos registrados
interface DatabaseModule {
	name: string
	version: string
	migrations: () => Promise<string[]>
	cleanupQueries: () => Promise<string[]>
	infoQueries: () => Promise<string[]>
}

const registeredModules: DatabaseModule[] = []

// Registrar módulo (llamado automáticamente por cada módulo)
export const registerModule = (module: DatabaseModule) => {
	registeredModules.push(module)
	console.log(
		`📦 Registered database module: ${module.name} v${module.version}`,
	)
}

// Auto-registrar módulos

registerModule(binsModule)

// Función para inicializar la base de datos (crear tablas si no existen)
export const initializeDatabase = async () => {
	try {
		console.log('🗄️ Initializing database...')
		console.log(`📦 Found ${registeredModules.length} registered modules`)

		// Crear tabla de control de versiones de migraciones si no existe
		await sqlite.execAsync(`
			CREATE TABLE IF NOT EXISTS __drizzle_migrations (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				hash TEXT NOT NULL UNIQUE,
				created_at INTEGER NOT NULL
			);
		`)

		// Ejecutar migraciones de todos los módulos registrados
		for (const module of registeredModules) {
			console.log(`🔧 Running migrations for module: ${module.name}`)
			const migrations = await module.migrations()

			for (let i = 0; i < migrations.length; i++) {
				const migration = migrations[i]
				const migrationHash = `${module.name}_v${i + 1}`

				// Verificar si la migración ya se aplicó
				const existingMigration = await sqlite.getFirstAsync(
					'SELECT * FROM __drizzle_migrations WHERE hash = ?',
					[migrationHash],
				)

				if (existingMigration) {
					console.log(`⏭️ Migration ${migrationHash} already applied, skipping`)
					continue
				}

				console.log(`▶️ Applying migration: ${migrationHash}`)
				await sqlite.execAsync(migration)

				// Registrar la migración como aplicada
				await sqlite.runAsync(
					'INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)',
					[migrationHash, Date.now()],
				)

				console.log(`✅ Migration ${migrationHash} applied successfully`)
			}
		}

		console.log('✅ Database initialized successfully')
	} catch (error) {
		console.error('❌ Error initializing database:', error)
		throw error
	}
}

// Función para limpiar la base de datos (útil para testing)
export const clearDatabase = async () => {
	try {
		console.log('🧹 Clearing database...')

		// Ejecutar cleanup de todos los módulos registrados
		for (const module of registeredModules) {
			console.log(`🧹 Clearing data for module: ${module.name}`)
			const cleanupQueries = await module.cleanupQueries()

			for (const query of cleanupQueries) {
				await sqlite.execAsync(query)
			}
		}

		console.log('✅ Database cleared successfully')
	} catch (error) {
		console.error('❌ Error clearing database:', error)
		throw error
	}
}

// Función para obtener información de la base de datos
export const getDatabaseInfo = async () => {
	try {
		const info: Record<string, any> = {}

		// Obtener información de todos los módulos registrados
		for (const module of registeredModules) {
			console.log(`📊 Getting info for module: ${module.name}`)
			const infoQueries = await module.infoQueries()

			const moduleInfo: Record<string, number> = {}
			for (let i = 0; i < infoQueries.length; i++) {
				const result = await sqlite.getFirstAsync(infoQueries[i])
				moduleInfo[`table_${i + 1}`] = (result as any)?.count || 0
			}

			info[module.name] = moduleInfo
		}

		return info
	} catch (error) {
		console.error('❌ Error getting database info:', error)
		return {}
	}
}

// Re-exportar la conexión para compatibilidad
export { db } from './connection'

// Exportar esquemas y servicios (se cargan dinámicamente)
export * from './bins'
