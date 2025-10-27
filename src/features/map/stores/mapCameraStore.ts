import type { Camera } from '@rnmapbox/maps'
import type React from 'react'
import { create } from 'zustand'

interface MapCameraStore {
	cameraRef: React.RefObject<Camera | null> | null
	setCameraRef: (ref: React.RefObject<Camera | null>) => void
}

export const useMapCameraStore = create<MapCameraStore>(set => ({
	cameraRef: null,
	setCameraRef: ref => set({ cameraRef: ref }),
}))
