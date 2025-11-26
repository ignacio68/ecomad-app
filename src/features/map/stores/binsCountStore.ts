import { BINS_CACHE_DURATION_MS } from '@/features/map/constants/markers'
import { BinType } from '@/shared/types/bins'
import { create } from 'zustand'

interface BinsCountStore {
	// Cache de conteos totales por tipo de contenedor
	totalCounts: Record<BinType, number>

	// Cache de datos jerárquicos (distritos/barrios)
	hierarchyData: Record<
		BinType,
		Array<{
			distrito: string
			barrio: string
			count: number
		}>
	>

	// Timestamps para saber cuándo se actualizaron los datos
	lastUpdated: Record<BinType, number>

	// Duración del cache en milisegundos (5 minutos por defecto)
	cacheDuration: number

	// Acciones
	setTotalCount: (binType: BinType, count: number) => void
	setHierarchyData: (
		binType: BinType,
		data: Array<{ distrito: string; barrio: string; count: number }>,
	) => void
	getTotalCount: (binType: BinType) => number | null
	getHierarchyData: (
		binType: BinType,
	) => Array<{ distrito: string; barrio: string; count: number }> | null
	isCacheValid: (binType: BinType) => boolean
	clearCache: (binType?: BinType) => void
}

export const useBinsCountStore = create<BinsCountStore>()((set, get) => ({
	totalCounts: {} as Record<BinType, number>,
	hierarchyData: {} as Record<
		BinType,
		Array<{ distrito: string; barrio: string; count: number }>
	>,
	lastUpdated: {} as Record<BinType, number>,
	cacheDuration: BINS_CACHE_DURATION_MS,

	setTotalCount: (binType, count) => {
		set(state => ({
			totalCounts: {
				...state.totalCounts,
				[binType]: count,
			},
			lastUpdated: {
				...state.lastUpdated,
				[binType]: Date.now(),
			},
		}))
	},

	setHierarchyData: (binType, data) => {
		set(state => ({
			hierarchyData: {
				...state.hierarchyData,
				[binType]: data,
			},
			lastUpdated: {
				...state.lastUpdated,
				[binType]: Date.now(),
			},
		}))
	},

	getTotalCount: binType => {
		const state = get()
		if (state.isCacheValid(binType)) {
			return state.totalCounts[binType] || null
		}
		return null
	},

	getHierarchyData: binType => {
		const state = get()
		if (state.isCacheValid(binType)) {
			return state.hierarchyData[binType] || null
		}
		return null
	},

	isCacheValid: binType => {
		const state = get()
		const lastUpdate = state.lastUpdated[binType]
		if (!lastUpdate) return false
		return Date.now() - lastUpdate < state.cacheDuration
	},

	clearCache: binType => {
		if (binType) {
			// Limpiar cache de un tipo específico
			set(state => {
				const newTotalCounts = { ...state.totalCounts }
				const newHierarchyData = { ...state.hierarchyData }
				const newLastUpdated = { ...state.lastUpdated }

				delete newTotalCounts[binType]
				delete newHierarchyData[binType]
				delete newLastUpdated[binType]

				return {
					totalCounts: newTotalCounts,
					hierarchyData: newHierarchyData,
					lastUpdated: newLastUpdated,
				}
			})
		} else {
			// Limpiar todo el cache
			set({
				totalCounts: {} as Record<BinType, number>,
				hierarchyData: {} as Record<
					BinType,
					Array<{ distrito: string; barrio: string; count: number }>
				>,
				lastUpdated: {} as Record<BinType, number>,
			})
		}
	},
}))
