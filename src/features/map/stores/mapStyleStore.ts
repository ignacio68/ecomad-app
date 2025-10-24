import { StyleURL } from '@rnmapbox/maps'
import { create } from 'zustand'

interface MapStyleState {
	currentStyle: StyleURL
	setMapStyle: (style: StyleURL) => void
}

export const useMapStyleStore = create<MapStyleState>(set => ({
	currentStyle: StyleURL.Outdoors,
	setMapStyle: (style: StyleURL) => set({ currentStyle: style }),
}))
