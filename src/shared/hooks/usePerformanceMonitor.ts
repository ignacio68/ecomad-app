// usePerformanceMonitor.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type Options = {
	/** Cada cuántos ms escribir logs en consola (0 = sin logs) */
	logEveryMs?: number
	/** Tamaño del buffer de frames para medias/percentiles */
	bufferSize?: number // p.ej. 300 = ~5s a 60 fps
}

const now = () =>
	(global as any)?.performance?.now
		? (global as any).performance.now()
		: Date.now()

export const usePerformanceMonitor = (opts: Options = {}) => {
	const { logEveryMs = 0, bufferSize = 300 } = opts

	// ---- FPS ----
	const [fpsInstant, setFpsInstant] = useState(0)
	const [fpsAvg, setFpsAvg] = useState(0)
	const [fpsP95, setFpsP95] = useState(0)

	const frameDeltasRef = useRef<number[]>([])
	const lastTsRef = useRef<number | null>(null)
	const rafRef = useRef<number | null>(null)
	const lastPublishRef = useRef<number>(now())

	// ---- Renders por segundo (RPS) ----
	const [rps, setRps] = useState(0)
	const totalRendersRef = useRef(0)
	const lastRendersRef = useRef(0)
	const rpsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

	// Cuenta un render de este componente consumidor
	totalRendersRef.current += 1

	const computeStats = useCallback((deltas: number[]) => {
		if (deltas.length === 0) return { instant: 0, avg: 0, p95: 0 }

		const last = deltas[deltas.length - 1]
		const instant = 1000 / last

		const avgDelta = deltas.reduce((acc, d) => acc + d, 0) / deltas.length
		const avg = 1000 / avgDelta

		// p95 sobre deltas (tiempos de frame más altos = peor), luego a FPS
		const sorted = [...deltas].sort((a, b) => a - b) // asc por ms
		const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))
		const p95delta = sorted[idx]
		const p95 = 1000 / p95delta

		return { instant, avg, p95 }
	}, [])

	// Bucle RAF para medir FPS
	useEffect(() => {
		const loop = () => {
			const t = now()
			const last = lastTsRef.current
			if (last != null) {
				const delta = Math.max(0.0001, t - last) // evita divisiones por 0
				const buf = frameDeltasRef.current
				buf.push(delta)
				if (buf.length > bufferSize) buf.shift()

				// Publica stats ~cada 500ms para no “flapear” el estado
				if (t - lastPublishRef.current > 500) {
					const { instant, avg, p95 } = computeStats(buf)
					setFpsInstant(instant)
					setFpsAvg(avg)
					setFpsP95(p95)
					lastPublishRef.current = t
				}
			}
			lastTsRef.current = t
			rafRef.current = requestAnimationFrame(loop)
		}
		rafRef.current = requestAnimationFrame(loop)
		return () => {
			if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
			rafRef.current = null
			lastTsRef.current = null
			frameDeltasRef.current = []
		}
	}, [bufferSize, computeStats])

	// Intervalo para RPS
	useEffect(() => {
		rpsTimerRef.current = setInterval(() => {
			const current = totalRendersRef.current
			const last = lastRendersRef.current
			setRps(current - last)
			lastRendersRef.current = current
		}, 1000)

		return () => {
			if (rpsTimerRef.current) clearInterval(rpsTimerRef.current)
			rpsTimerRef.current = null
		}
	}, [])

	// Logs opcionales
	useEffect(() => {
		if (!logEveryMs || logEveryMs <= 0) return
		const id = setInterval(() => {
			// Redondeo para legibilidad
			const i = fpsInstant.toFixed(1)
			const a = fpsAvg.toFixed(1)
			const p = fpsP95.toFixed(1)
			console.log(`[Perf] FPS i:${i} avg:${a} p95:${p} | RPS:${rps}`)
		}, logEveryMs)
		return () => clearInterval(id)
	}, [logEveryMs, fpsInstant, fpsAvg, fpsP95, rps])

	return {
		fpsInstant,
		fpsAvg,
		fpsP95,
		rps,
	}
}
