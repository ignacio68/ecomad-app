import { BinsService } from '@/db/bins/service'
import { getAllBins, getBinsCountsHierarchy } from '@/shared/services/api/bins'
import { BinType } from '@/shared/types/bins'
import { useBinsCountStore } from '@map/stores/binsCountStore'

const loadingMutex = new Map<BinType, Promise<void>>()

export const isDataCached = async (binType: BinType): Promise<boolean> => {
	try {
		const [totalCount, containers] = await Promise.all([
			BinsService.getTotalCount(binType),
			BinsService.getContainersData(binType),
		])

		const isCached =
			totalCount !== null && containers !== null && containers.length > 0

		return isCached
	} catch (error) {
		console.error(`❌ Error checking cache for ${binType}:`, error)
		return false
	}
}

export const downloadAndCacheData = async (binType: BinType): Promise<void> => {
	try {
		if (__DEV__) {
			console.log(`🔄 Downloading and caching data for ${binType}...`)
		}

		console.log(`📥 Downloading data for ${binType}...`)
		const [allBinsResponse, hierarchyResponse] = await Promise.all([
			getAllBins(binType),
			getBinsCountsHierarchy(binType),
		])

		if (!allBinsResponse.success) {
			throw new Error(`Failed to download bins: ${allBinsResponse.message}`)
		}

		if (!hierarchyResponse.success) {
			throw new Error(
				`Failed to download hierarchy data: ${hierarchyResponse.message}`,
			)
		}

		const allBins = allBinsResponse.data
		const hierarchyData = hierarchyResponse.data

		console.log(
			`✅ Downloaded ${allBins.length} bins and ${hierarchyData.length} hierarchy records`,
		)

		console.log(`💾 Saving data to database...`)
		await Promise.all([
			BinsService.saveContainersData(binType, allBins),
			BinsService.saveHierarchyData(binType, hierarchyData),
			BinsService.saveTotalCount(binType, allBins.length),
		])

		console.log(`✅ Successfully cached data for ${binType}`)
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'Unknown error'
		console.error(
			`❌ Error downloading and caching data for ${binType}:`,
			errorMessage,
		)
		throw error
	}
}

const getNewOperation = async (binType: BinType): Promise<void> => {
	try {
		if (__DEV__) {
			console.log(`🔄 Starting ensureDataAvailable for ${binType}`)
		}

		const isCached = await isDataCached(binType)

		if (isCached) {
			console.log(`✅ ensureDataAvailable::Data already cached for ${binType}`)
		} else {
			console.log(`📥 Data not cached for ${binType}, downloading...`)
			await downloadAndCacheData(binType)
		}

		const totalCount = await BinsService.getTotalCount(binType)
		if (totalCount !== null) {
			useBinsCountStore.getState().setTotalCount(binType, totalCount)
		}

		console.log(`✅ Completed ensureDataAvailable for ${binType}`)
	} catch (error) {
		console.error(`❌ Error ensuring data availability for ${binType}:`, error)
		throw error
	} finally {
		loadingMutex.delete(binType)
	}
}

export const ensureDataAvailable = async (binType: BinType): Promise<void> => {
	if (loadingMutex.has(binType)) {
		console.log(`⏳ Waiting for existing operation for ${binType}...`)
		return loadingMutex.get(binType)!
	}

	const operation = getNewOperation(binType)
	loadingMutex.set(binType, operation)
	return operation
}

export const clearCache = async (binType: BinType): Promise<void> => {
	try {
		await BinsService.clearCache(binType)
		console.log(`✅ Cleared cache for ${binType}`)
	} catch (error) {
		console.error(`❌ Error clearing cache for ${binType}:`, error)
		throw error
	}
}
