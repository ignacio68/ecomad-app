// Exportar esquemas
export * from './schema'

// Exportar servicio
export * from './service'

// Exportar migraciones
export * from './migrations'

// Metadatos del módulo
export const binsModule = {
	name: 'bins',
	version: '1.0.0',
	migrations: () => import('./migrations').then(m => m.binsMigrations),
	cleanupQueries: () => import('./migrations').then(m => m.binsCleanupQueries),
	infoQueries: () => import('./migrations').then(m => m.binsInfoQueries),
}

// El módulo se registra automáticamente cuando se importa desde db/index.ts
