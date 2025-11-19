import * as FileSystem from 'expo-file-system'
import type { BinPoint } from '@map/types/mapData'
import type { BinType } from '@/shared/types/bins'

const CACHE_DIRECTORY = new FileSystem.Directory(
	FileSystem.Paths.cache,
	'bins-geojson-cache',
)

const resolveFile = (binType: BinType) =>
	new FileSystem.File(CACHE_DIRECTORY, `${binType}.json`)

const ensureDir = () => {
	try {
		if (!CACHE_DIRECTORY.exists) {
			CACHE_DIRECTORY.create({ intermediates: true, idempotent: true })
		}
	} catch (error) {
		console.warn('⚠️ [GEOJSON_CACHE] Unable to ensure cache directory', error)
	}
}

export const readGeoJsonCache = async (
	binType: BinType,
): Promise<BinPoint[] | null> => {
	try {
		const file = resolveFile(binType)
		if (!file.exists) {
			return null
		}
		const content = await file.text()
		const parsed = JSON.parse(content) as BinPoint[]
		console.log(
			`📦 [GEOJSON_CACHE] Loaded ${parsed.length} features for ${binType} from disk`,
		)
		return parsed
	} catch (error) {
		console.warn(
			`⚠️ [GEOJSON_CACHE] Failed to load cache for ${binType}, ignoring`,
			error,
		)
		return null
	}
}

export const writeGeoJsonCache = async (
	binType: BinType,
	points: BinPoint[],
): Promise<void> => {
	try {
		ensureDir()
		const file = resolveFile(binType)
		file.create({ overwrite: true, intermediates: true })
		file.write(JSON.stringify(points))
		console.log(
			`💾 [GEOJSON_CACHE] Persisted ${points.length} features for ${binType}`,
		)
	} catch (error) {
		console.warn(
			`⚠️ [GEOJSON_CACHE] Failed to persist cache for ${binType}`,
			error,
		)
	}
}

export const clearGeoJsonCache = async (binType?: BinType): Promise<void> => {
	try {
		if (binType) {
			const file = resolveFile(binType)
			if (file.exists) {
				file.delete()
			}
			console.log(`🗑️ [GEOJSON_CACHE] Cleared cache for ${binType}`)
			return
		}

		if (!CACHE_DIRECTORY.exists) return

		CACHE_DIRECTORY.list().forEach(entry => {
			entry.delete()
		})
		console.log('🗑️ [GEOJSON_CACHE] Cleared cache directory')
	} catch (error) {
		console.warn('⚠️ [GEOJSON_CACHE] Failed to clear cache', error)
	}
}
