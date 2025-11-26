import { BinType } from '@/shared/types/bins'
import { type BinPoint } from '@map/types/mapData'
import { create } from 'zustand'

interface BinsCacheState {
	pointsCache: Partial<Record<BinType, BinPoint[]>>
	setPointsCache: (binType: BinType, points: BinPoint[]) => void
	getPointsCache: (binType: BinType) => BinPoint[] | null
	clearPointsCache: (binType?: BinType) => void
	clearAllCache: () => void
}

export const useBinsCacheStore = create<BinsCacheState>((set, get) => ({
	pointsCache: {} as Partial<Record<BinType, BinPoint[]>>,

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
				const updated = { ...state.pointsCache }
				delete updated[binType]
				return { pointsCache: updated }
			})
			return
		}

		set({ pointsCache: {} })
	},

	clearAllCache: () => {
		set({ pointsCache: {} })
	},
}))
