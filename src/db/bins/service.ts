import { BinType } from '@/shared/types/bins'
import { eq } from 'drizzle-orm'
import { db } from '../connection'
import {
	binsContainersCache,
	binsHierarchyCache,
	binsTotalCountCache,
	type BinsContainersCacheRecord,
} from './schema'

export interface HierarchyData {
	distrito: string
	barrio: string
	count: number
}

export class BinsService {
	// ===== HIERARCHY CACHE =====

	/**
	 * Guardar datos jerárquicos en cache
	 */
	static async saveHierarchyData(
		binType: BinType,
		data: HierarchyData[],
	): Promise<void> {
		try {
			// Primero eliminar datos existentes para este binType
			await db
				.delete(binsHierarchyCache)
				.where(eq(binsHierarchyCache.binType, binType))

			// Insertar nuevos datos solo si hay datos
			if (data.length === 0) {
				console.log(`⚠️ No hierarchy data to save for ${binType}`)
				return
			}

			const records = data.map(item => ({
				binType,
				distrito: item.distrito,
				barrio: item.barrio,
				count: item.count,
				createdAt: new Date(),
				updatedAt: new Date(),
			}))

			await db.insert(binsHierarchyCache).values(records)
			console.log(`✅ Saved ${records.length} hierarchy records for ${binType}`)
		} catch (error) {
			console.error(`❌ Error saving hierarchy data for ${binType}:`, error)
			throw error
		}
	}

	/**
	 * Obtener datos jerárquicos del cache
	 */
	static async getHierarchyData(
		binType: BinType,
	): Promise<HierarchyData[] | null> {
		try {
			const records = await db
				.select()
				.from(binsHierarchyCache)
				.where(eq(binsHierarchyCache.binType, binType))

			if (records.length === 0) {
				return null
			}

			return records.map(record => ({
				distrito: record.distrito,
				barrio: record.barrio,
				count: record.count,
			}))
		} catch (error) {
			console.error(`❌ Error getting hierarchy data for ${binType}:`, error)
			return null
		}
	}

	// ===== TOTAL COUNT CACHE =====

	/**
	 * Guardar conteo total en cache
	 */
	static async saveTotalCount(
		binType: BinType,
		totalCount: number,
	): Promise<void> {
		try {
			// Usar upsert (insert or update)
			const existing = await db
				.select()
				.from(binsTotalCountCache)
				.where(eq(binsTotalCountCache.binType, binType))
				.limit(1)

			if (existing.length > 0) {
				// Actualizar
				await db
					.update(binsTotalCountCache)
					.set({
						totalCount,
						updatedAt: new Date(),
					})
					.where(eq(binsTotalCountCache.binType, binType))
			} else {
				// Insertar
				await db.insert(binsTotalCountCache).values({
					binType,
					totalCount,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
			}

			console.log(`✅ Saved total count for ${binType}: ${totalCount}`)
		} catch (error) {
			console.error(`❌ Error saving total count for ${binType}:`, error)
			throw error
		}
	}

	/**
	 * Obtener conteo total del cache
	 */
	static async getTotalCount(binType: BinType): Promise<number | null> {
		try {
			const record = await db
				.select()
				.from(binsTotalCountCache)
				.where(eq(binsTotalCountCache.binType, binType))
				.limit(1)

			return record.length > 0 ? record[0].totalCount : null
		} catch (error) {
			console.error(`❌ Error getting total count for ${binType}:`, error)
			return null
		}
	}

	// ===== CONTAINERS CACHE =====

	/**
	 * Guardar datos de contenedores individuales
	 */
	static async saveContainersData(
		binType: BinType,
		containers: any[],
	): Promise<void> {
		try {
			console.log(
				`🔍 BinsService.saveContainersData called for ${binType} with ${containers.length} containers`,
			)

			// Debug: Verificar si hay duplicados en los datos de entrada
			const inputIds = containers.map(c => c.id.toString())
			const uniqueInputIds = new Set(inputIds)
			if (inputIds.length !== uniqueInputIds.size) {
				console.warn(
					`⚠️ Input data has duplicates: ${inputIds.length} → ${uniqueInputIds.size} unique IDs`,
				)
				const duplicates = inputIds.filter(
					(id, index) => inputIds.indexOf(id) !== index,
				)
				console.warn(`🔍 Duplicate IDs in input:`, [...new Set(duplicates)])

				// Filtrar duplicados manteniendo el primer registro de cada ID
				const seenIds = new Set()
				containers = containers.filter(container => {
					const id = container.id.toString()
					if (seenIds.has(id)) {
						return false
					}
					seenIds.add(id)
					return true
				})
				console.log(
					`🧹 Filtered duplicates: ${inputIds.length} → ${containers.length} containers`,
				)
			}

			// Eliminar datos existentes para este binType
			await db
				.delete(binsContainersCache)
				.where(eq(binsContainersCache.binType, binType))

			// Insertar nuevos datos solo si hay datos
			if (containers.length === 0) {
				console.log(`⚠️ No container data to save for ${binType}`)
				return
			}

			const records = containers.map(container => ({
				binType,
				containerId: container.id.toString(), // Usar el ID único de la base de datos
				distrito: container.distrito || 'Sin distrito',
				barrio: container.barrio || 'Sin barrio',
				direccion: container.direccion_completa || 'Dirección no disponible',
				latitud: container.latitud,
				longitud: container.longitud,
				createdAt: new Date(),
				updatedAt: new Date(),
			}))

			await db.insert(binsContainersCache).values(records)
			console.log(`✅ Saved ${records.length} container records for ${binType}`)
		} catch (error) {
			console.error(`❌ Error saving containers data for ${binType}:`, error)
			throw error
		}
	}

	/**
	 * Obtener datos de contenedores del cache
	 */
	static async getContainersData(
		binType: BinType,
		limit?: number,
	): Promise<BinsContainersCacheRecord[] | null> {
		try {
			console.log(`🔍 BinsService.getContainersData called for ${binType}`)

			const baseQuery = db
				.select()
				.from(binsContainersCache)
				.where(eq(binsContainersCache.binType, binType))

			const records = limit ? await baseQuery.limit(limit) : await baseQuery
			console.log(
				`🔍 Found ${records.length} records in database for ${binType}`,
			)

			if (records.length === 0) {
				console.log(`⚠️ No records found in database for ${binType}`)
				return null
			}

			// Verificar duplicados por containerId
			const containerIds = records.map(r => r.containerId)
			const uniqueIds = new Set(containerIds)

			if (containerIds.length !== uniqueIds.size) {
				console.warn(
					`⚠️ Found ${containerIds.length - uniqueIds.size} duplicate containerIds in database for ${binType}`,
				)

				// Encontrar duplicados específicos
				const duplicates = containerIds.filter(
					(id, index) => containerIds.indexOf(id) !== index,
				)
				console.warn(`🔍 Duplicate containerIds:`, [...new Set(duplicates)])

				// Limpiar duplicados - mantener solo el primero de cada grupo
				const seen = new Set()
				const cleanedRecords = records.filter(record => {
					if (seen.has(record.containerId)) {
						console.log(
							`🗑️ Removing duplicate: ${record.containerId} (id: ${record.id})`,
						)
						return false
					}
					seen.add(record.containerId)
					return true
				})

				console.log(
					`✅ Cleaned ${records.length} → ${cleanedRecords.length} records for ${binType}`,
				)

				// Limpiar cache para forzar recarga con datos limpios
				console.log(`🧹 Clearing cache for ${binType} due to duplicates`)

				return cleanedRecords
			}

			// Devolver los records directamente sin mapear
			return records
		} catch (error) {
			console.error(`❌ Error getting containers data for ${binType}:`, error)
			return null
		}
	}

	// ===== UTILITY METHODS =====

	/**
	 * Limpiar cache para un tipo específico
	 */
	static async clearCache(binType: BinType): Promise<void> {
		try {
			await db
				.delete(binsHierarchyCache)
				.where(eq(binsHierarchyCache.binType, binType))
			await db
				.delete(binsTotalCountCache)
				.where(eq(binsTotalCountCache.binType, binType))
			await db
				.delete(binsContainersCache)
				.where(eq(binsContainersCache.binType, binType))

			console.log(`✅ Cleared cache for ${binType}`)
		} catch (error) {
			console.error(`❌ Error clearing cache for ${binType}:`, error)
			throw error
		}
	}

	/**
	 * Verificar duplicados en la base de datos local
	 */
	static async checkDuplicates(binType: BinType): Promise<void> {
		try {
			console.log(`🔍 Checking for duplicates in ${binType}...`)

			const records = await db
				.select()
				.from(binsContainersCache)
				.where(eq(binsContainersCache.binType, binType))

			console.log(`📊 Total records: ${records.length}`)

			// Agrupar por containerId para encontrar duplicados
			const groupedById = records.reduce(
				(acc, record) => {
					const id = record.containerId
					if (!acc[id]) {
						acc[id] = []
					}
					acc[id].push(record)
					return acc
				},
				{} as Record<string, any[]>,
			)

			// Encontrar duplicados
			const duplicates = Object.entries(groupedById).filter(
				([id, records]) => records.length > 1,
			)

			if (duplicates.length > 0) {
				console.log(`⚠️ Found ${duplicates.length} duplicate container IDs:`)
				duplicates.forEach(([id, records]) => {
					console.log(`  - ${id}: ${records.length} duplicates`)
					console.log(
						`    Records:`,
						records.map(r => ({
							id: r.id,
							distrito: r.distrito,
							barrio: r.barrio,
							latitud: r.latitud,
							longitud: r.longitud,
						})),
					)
				})
			} else {
				console.log(`✅ No duplicates found in ${binType}`)
			}

			return
		} catch (error) {
			console.error(`❌ Error checking duplicates for ${binType}:`, error)
			throw error
		}
	}

	/**
	 * Eliminar duplicados de la base de datos local
	 */
	static async removeDuplicates(binType: BinType): Promise<void> {
		try {
			console.log(`🔍 Removing duplicates from ${binType}...`)

			const records = await db
				.select()
				.from(binsContainersCache)
				.where(eq(binsContainersCache.binType, binType))

			// Agrupar por containerId
			const groupedById = records.reduce(
				(acc, record) => {
					const id = record.containerId
					if (!acc[id]) {
						acc[id] = []
					}
					acc[id].push(record)
					return acc
				},
				{} as Record<string, any[]>,
			)

			// Encontrar duplicados y eliminar los extras
			const duplicates = Object.entries(groupedById).filter(
				([id, records]) => records.length > 1,
			)

			if (duplicates.length > 0) {
				console.log(`⚠️ Removing ${duplicates.length} duplicate groups...`)

				for (const [containerId, duplicateRecords] of duplicates) {
					// Mantener solo el primer registro, eliminar el resto
					const toKeep = duplicateRecords[0]
					const toDelete = duplicateRecords.slice(1)

					console.log(`  - Keeping record ${toKeep.id} for ${containerId}`)

					for (const record of toDelete) {
						await db
							.delete(binsContainersCache)
							.where(eq(binsContainersCache.id, record.id))
						console.log(`    - Deleted duplicate record ${record.id}`)
					}
				}

				console.log(`✅ Removed duplicates from ${binType}`)
			} else {
				console.log(`✅ No duplicates found in ${binType}`)
			}

			return
		} catch (error) {
			console.error(`❌ Error removing duplicates for ${binType}:`, error)
			throw error
		}
	}

	/**
	 * Limpiar todo el cache de bins
	 */
	static async clearAllCache(): Promise<void> {
		try {
			await db.delete(binsHierarchyCache)
			await db.delete(binsTotalCountCache)
			await db.delete(binsContainersCache)

			console.log('✅ Cleared all bins cache')
		} catch (error) {
			console.error('❌ Error clearing all bins cache:', error)
			throw error
		}
	}
}
