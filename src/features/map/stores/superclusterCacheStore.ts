import { BinType } from '@/shared/types/bins'
import { create } from 'zustand'
import { BinPoint } from '../hooks/useSuperclusterBins'

interface SuperclusterCacheState {
	// Cache de puntos procesados por binType
	pointsCache: Partial<Record<BinType, BinPoint[]>>

	// Cache de clusters por binType y zoom
	clustersCache: Record<string, BinPoint[]>

	// Métodos para gestionar el cache
	setPointsCache: (binType: BinType, points: BinPoint[]) => void
	getPointsCache: (binType: BinType) => BinPoint[] | null
	clearPointsCache: (binType?: BinType) => void

	setClustersCache: (
		binType: BinType,
		zoom: number,
		clusters: BinPoint[],
	) => void
	getClustersCache: (binType: BinType, zoom: number) => BinPoint[] | null
	clearClustersCache: (binType?: BinType) => void

	// Limpiar todo el cache
	clearAllCache: () => void
}

export const useSuperclusterCacheStore = create<SuperclusterCacheState>(
	(set, get) => ({
		pointsCache: {} as Partial<Record<BinType, BinPoint[]>>,
		clustersCache: {} as Record<string, BinPoint[]>,

		setPointsCache: (binType: BinType, points: BinPoint[]) => {
			set(state => ({
				pointsCache: {
					...state.pointsCache,
					[binType]: points,
				},
			}))
		},

		getPointsCache: (binType: BinType) => {
			const state = get()
			return state.pointsCache[binType] || null
		},

		clearPointsCache: (binType?: BinType) => {
			if (binType) {
				set(state => {
					const newCache = { ...state.pointsCache }
					delete newCache[binType]
					return { pointsCache: newCache }
				})
			} else {
				set({ pointsCache: {} })
			}
		},

		setClustersCache: (
			binType: BinType,
			zoom: number,
			clusters: BinPoint[],
		) => {
			const key = `${binType}_${zoom}`
			set(state => ({
				clustersCache: {
					...state.clustersCache,
					[key]: clusters,
				},
			}))
		},

		getClustersCache: (binType: BinType, zoom: number) => {
			const state = get()
			const key = `${binType}_${zoom}`
			return state.clustersCache[key] || null
		},

		clearClustersCache: (binType?: BinType) => {
			if (binType) {
				set(state => {
					const newCache = { ...state.clustersCache }
					Object.keys(newCache).forEach(key => {
						if (key.startsWith(binType)) {
							delete newCache[key]
						}
					})
					return { clustersCache: newCache }
				})
			} else {
				set({ clustersCache: {} })
			}
		},

		clearAllCache: () => {
			set({
				pointsCache: {},
				clustersCache: {},
			})
		},
	}),
)
