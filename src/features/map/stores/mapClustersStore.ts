import { BinPoint } from '@map/types/mapData'
import { create } from 'zustand'

interface MapClustersStore {
	// Clusters calculados listos para renderizar
	displayClusters: BinPoint[]
	// Supercluster instance (para expandir clusters)
	superclusterInstance: any | null
	// Actions
	setDisplayClusters: (clusters: BinPoint[]) => void
	setSuperclusterInstance: (instance: any) => void
	clearClusters: () => void
}

export const useMapClustersStore = create<MapClustersStore>(set => ({
	displayClusters: [],
	superclusterInstance: null,
	setDisplayClusters: clusters => {
		console.log('🎯 [CLUSTERS_STORE] Setting display clusters:', clusters.length)
		set({ displayClusters: clusters })
	},
	setSuperclusterInstance: instance => {
		set({ superclusterInstance: instance })
	},
	clearClusters: () => {
		console.log('🧹 [CLUSTERS_STORE] Clearing clusters')
		set({ displayClusters: [], superclusterInstance: null })
	},
}))

