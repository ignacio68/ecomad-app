import { db, sqlite } from '@/db/connection'
import { BATCH_SIZE } from '@/db/constants/db'
import { BinType } from '@/shared/types/bins'
import { eq } from 'drizzle-orm'
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

			// Usar transacción para operaciones atómicas
			await db.transaction(async tx => {
				// Eliminar datos existentes para este binType
				await tx
					.delete(binsHierarchyCache)
					.where(eq(binsHierarchyCache.binType, binType))

				// Insertar nuevos datos
				await tx.insert(binsHierarchyCache).values(records)
			})

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
				barrio: record.barrio || '',
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
			// Usar transacción para operación atómica de upsert
			await db.transaction(async tx => {
				const existing = await tx
					.select()
					.from(binsTotalCountCache)
					.where(eq(binsTotalCountCache.binType, binType))
					.limit(1)

				if (existing.length > 0) {
					// Actualizar
					await tx
						.update(binsTotalCountCache)
						.set({
							totalCount,
							updatedAt: new Date(),
						})
						.where(eq(binsTotalCountCache.binType, binType))
				} else {
					// Insertar
					await tx.insert(binsTotalCountCache).values({
						binType,
						totalCount,
						createdAt: new Date(),
						updatedAt: new Date(),
					})
				}
			})

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
			if (containers.length === 0) {
				console.log(`⚠️ No container data to save for ${binType}`)
				return
			}

			const records = containers.map(container => ({
				binType,
				containerId: container.id.toString(),
				category_group_id: container.category_group_id,
				category_id: container.category_id,
				district_code: container.district_code,
				neighborhood_code: container.neighborhood_code,
				address: container.address || 'Dirección no disponible',
				lat: container.lat,
				lng: container.lng,
				load_type: container.load_type,
				direction: container.direction,
				subtype: container.subtype,
				placement_type: container.placement_type,
				notes: container.notes,
				bus_stop: container.bus_stop,
				interurban_node: container.interurban_node,
				createdAt: new Date(),
				updatedAt: new Date(),
			}))

			const startTime = Date.now()
			let insertedCount = 0

			// DELETE fuera de la transacción usando SQL async (no bloquea el hilo principal)
			// Esto evita bloquear la UI durante el DELETE
			const deleteStartTime = Date.now()
			await sqlite.runAsync(
				'DELETE FROM bins_containers_cache WHERE bin_type = ?',
				[binType],
			)
			const deleteDuration = Date.now() - deleteStartTime
			console.log(
				`🗑️ Deleted existing records for ${binType} in ${deleteDuration}ms`,
			)

			// INSERT dentro de transacción async optimizada usando withTransactionAsync
			// Esto es más eficiente que db.transaction() para operaciones masivas
			await sqlite.withTransactionAsync(async () => {
				// Preparar statement una sola vez para mejor rendimiento
				const insertStmt = await sqlite.prepareAsync(`
					INSERT INTO bins_containers_cache (
						bin_type, container_id, category_group_id, category_id,
						district_code, neighborhood_code, address, lat, lng,
						load_type, direction, subtype, placement_type, notes,
						bus_stop, interurban_node, created_at, updated_at
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				`)

				try {
					// Insertar en lotes para evitar stack overflow con grandes datasets
					for (let i = 0; i < records.length; i += BATCH_SIZE) {
						const batch = records.slice(i, i + BATCH_SIZE)

						// Ejecutar cada registro del batch usando parámetros posicionales
						for (const record of batch) {
							await insertStmt.executeAsync([
								record.binType,
								record.containerId,
								record.category_group_id,
								record.category_id,
								record.district_code,
								record.neighborhood_code ?? null,
								record.address,
								record.lat,
								record.lng,
								record.load_type ?? null,
								record.direction ?? null,
								record.subtype ?? null,
								record.placement_type ?? null,
								record.notes ?? null,
								record.bus_stop ?? null,
								record.interurban_node ?? null,
								record.createdAt.getTime(),
								record.updatedAt.getTime(),
							])
						}

						insertedCount += batch.length
						console.log(
							`📦 Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}: ${insertedCount}/${records.length}`,
						)
					}
				} finally {
					await insertStmt.finalizeAsync()
				}
			})

			const duration = Date.now() - startTime
			console.log(
				`✅ Saved ${insertedCount} containers for ${binType} in ${duration}ms (${Math.round(insertedCount / (duration / 1000))} records/sec)`,
			)
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
