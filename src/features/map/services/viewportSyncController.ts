let isPaused = false
let resumeTimer: number | null = null

export const isViewportSyncPaused = () => isPaused

export const pauseViewportSync = (resumeAfterMs?: number) => {
	isPaused = true
	if (resumeTimer) {
		clearTimeout(resumeTimer)
		resumeTimer = null
	}
	if (resumeAfterMs && resumeAfterMs > 0) {
		resumeTimer = setTimeout(() => {
			isPaused = false
			resumeTimer = null
		}, resumeAfterMs)
	}
}

export const resumeViewportSync = () => {
	isPaused = false
	if (resumeTimer) {
		clearTimeout(resumeTimer)
		resumeTimer = null
	}
}

/** Ejecuta una operación con el sync pausado y un cooldown opcional al final */
export const runWithViewportSyncPaused = async <T>(
	operation: () => Promise<T> | T,
	cooldownMs = 120,
): Promise<T> => {
	pauseViewportSync()
	try {
		return await operation()
	} finally {
		pauseViewportSync(cooldownMs)
	}
}
