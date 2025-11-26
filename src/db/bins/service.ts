import { db, sqlite } from '@/db/connection'
import { BinType } from '@/shared/types/bins'
import type { LngLatBounds } from '@map/types/mapData'
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

// ===== HIERARCHY CACHE =====

/**
 * Guardar datos jerárquicos en cache
 */
export const saveHierarchyData = async (
	binType: BinType,
	data: HierarchyData[],
): Promise<void> => {
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
export const getHierarchyData = async (
	binType: BinType,
): Promise<HierarchyData[] | null> => {
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
export const saveTotalCount = async (
	binType: BinType,
	totalCount: number,
): Promise<void> => {
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
export const getTotalCount = async (
	binType: BinType,
): Promise<number | null> => {
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
export const saveBinsData = async (
	binType: BinType,
	bins: any[],
): Promise<void> => {
	try {
		if (bins.length === 0) {
			console.log(`⚠️ No bin data to save for ${binType}`)
			return
		}

		const records = bins.map(bin => ({
			binType,
			binId: bin.id.toString(),
			category_group_id: bin.category_group_id,
			category_id: bin.category_id,
			district_code: bin.district_code,
			neighborhood_code: bin.neighborhood_code,
			address: bin.address || 'Dirección no disponible',
			lat: bin.lat,
			lng: bin.lng,
			load_type: bin.load_type,
			direction: bin.direction,
			subtype: bin.subtype,
			placement_type: bin.placement_type,
			notes: bin.notes,
			bus_stop: bin.bus_stop,
			interurban_node: bin.interurban_node,
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
		// El prepared statement se reutiliza automáticamente para todos los inserts
		await sqlite.withTransactionAsync(async () => {
			// Preparar statement una sola vez para mejor rendimiento
			const insertStmt = await sqlite.prepareAsync(`
					INSERT INTO bins_containers_cache (
						bin_type, container_id, category_group_id, category_id,
						district_code, neighborhood_code, address, lat, lng,
						load_type, direction, subtype, placement_type, notes,
						bus_stop, interurban_node, created_at, updated_at
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				`)

			try {
				for (const record of records) {
					await insertStmt.executeAsync([
						record.binType,
						record.binId,
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
					insertedCount++
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
export const getBinsData = async (
	binType: BinType,
	limit?: number,
): Promise<BinsContainersCacheRecord[] | null> => {
	try {
		console.time(`⏱️ [GETCONTAINERSDATA] total-${binType}`)
		const limitText = limit ? ` (limit: ${limit})` : ' (no limit)'
		console.log(`🔍 BinsService.getBinsData called for ${binType}${limitText}`)

		// Verificar primero el total en la base de datos usando SQL directo
		const countResult = await sqlite.getFirstAsync<{ count: number }>(
			'SELECT COUNT(*) as count FROM bins_containers_cache WHERE bin_type = ?',
			[binType],
		)
		const totalInDB = countResult?.count || 0
		console.log(
			`🔍 [GETCONTAINERSDATA] Total records in DB for ${binType}: ${totalInDB}`,
		)

		const baseQuery = db
			.select()
			.from(binsContainersCache)
			.where(eq(binsContainersCache.binType, binType))
			.orderBy(binsContainersCache.id) // Ordenar por ID para asegurar lectura consistente

		const records = limit ? await baseQuery.limit(limit) : await baseQuery

		const diffText =
			totalInDB === records.length
				? ''
				: ` (⚠️ Expected ${totalInDB}, got ${records.length})`
		console.log(
			`🔍 Found ${records.length} records in database for ${binType}${diffText}`,
		)

		if (records.length === 0) {
			console.log(`⚠️ No records found in database for ${binType}`)
			return null
		}

		// Si hay diferencia, intentar usar SQL directo para obtener todos
		if (!limit && totalInDB > 0 && records.length < totalInDB) {
			console.warn(
				`⚠️ [GETCONTAINERSDATA] Drizzle returned ${records.length} but DB has ${totalInDB}, using SQL direct query`,
			)
			const sqlRecords = await sqlite.getAllAsync<any>(
				'SELECT * FROM bins_containers_cache WHERE bin_type = ? ORDER BY id',
				[binType],
			)
			console.log(
				`🔍 [GETCONTAINERSDATA] SQL direct query returned ${sqlRecords.length} records`,
			)

			return sqlRecords.map(mapSqlRecordToCacheRecord)
		}

		// Devolver los records directamente sin mapear
		console.timeEnd(`⏱️ [GETCONTAINERSDATA] total-${binType}`)
		return records
	} catch (error) {
		console.error(`❌ Error getting bins data for ${binType}:`, error)
		return null
	}
}

const mapSqlRecordToCacheRecord = (r: any): BinsContainersCacheRecord => ({
	id: r.id,
	binType: r.bin_type,
	binId: r.container_id,
	category_group_id: r.category_group_id,
	category_id: r.category_id,
	district_code: r.district_code,
	neighborhood_code: r.neighborhood_code,
	address: r.address,
	lat: r.lat,
	lng: r.lng,
	load_type: r.load_type,
	direction: r.direction,
	subtype: r.subtype,
	placement_type: r.placement_type,
	notes: r.notes,
	bus_stop: r.bus_stop,
	interurban_node: r.interurban_node,
	createdAt: new Date(r.created_at),
	updatedAt: new Date(r.updated_at),
})

export const getContainersDataInBounds = async (
	binType: BinType,
	bounds: LngLatBounds,
	limit = 2000,
): Promise<BinsContainersCacheRecord[] | null> => {
	try {
		const [[minLng, minLat], [maxLng, maxLat]] = bounds
		console.time(`⏱️ [GET_BOUNDED_CONTAINERS] total-${binType}`)
		const rows = await sqlite.getAllAsync<any>(
			`
        SELECT *
        FROM bins_containers_cache
        WHERE bin_type = ?
          AND lat BETWEEN ? AND ?
          AND lng BETWEEN ? AND ?
        ORDER BY id
        LIMIT ?
      `,
			[binType, minLat, maxLat, minLng, maxLng, limit],
		)

		if (!rows || rows.length === 0) {
			console.log(
				`⚠️ [GET_BOUNDED_CONTAINERS] No rows for ${binType} within bounds`,
			)
			console.timeEnd(`⏱️ [GET_BOUNDED_CONTAINERS] total-${binType}`)
			return null
		}

		console.log(
			`📦 [GET_BOUNDED_CONTAINERS] Loaded ${rows.length} rows for ${binType}`,
		)
		console.timeEnd(`⏱️ [GET_BOUNDED_CONTAINERS] total-${binType}`)
		return rows.map(mapSqlRecordToCacheRecord)
	} catch (error) {
		console.error(
			`❌ [GET_BOUNDED_CONTAINERS] Error loading ${binType} bounds`,
			error,
		)
		return null
	}
}

// ===== UTILITY METHODS =====

/**
 * Limpiar cache para un tipo específico
 */
export const clearCache = async (binType: BinType): Promise<void> => {
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
export const clearAllCache = async (): Promise<void> => {
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
