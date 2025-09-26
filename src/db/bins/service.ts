import { BinType } from '@/shared/types/bins'
import { eq } from 'drizzle-orm'
import { db } from '../connection'
import {
	binsContainersCache,
	binsHierarchyCache,
	binsTotalCountCache,
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
				containerId:
					container.COD_DIST +
					'-' +
					container.COD_BARRIO +
					'-' +
					container.LATITUD +
					'-' +
					container.LONGITUD,
				distrito: container.COD_DIST,
				barrio: container.COD_BARRIO,
				direccion: container.DIRECCION_COMPLETA || 'Dirección no disponible',
				latitud: container.LATITUD,
				longitud: container.LONGITUD,
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
	): Promise<any[] | null> {
		try {
			const baseQuery = db
				.select()
				.from(binsContainersCache)
				.where(eq(binsContainersCache.binType, binType))

			const records = limit ? await baseQuery.limit(limit) : await baseQuery

			if (records.length === 0) {
				return null
			}

			return records.map(record => ({
				COD_DIST: record.distrito,
				COD_BARRIO: record.barrio,
				DIRECCION_COMPLETA: record.direccion,
				LATITUD: record.latitud,
				LONGITUD: record.longitud,
			}))
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
