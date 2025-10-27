import { useEffect, useRef } from 'react'

type Opts = {
	shallowArrays?: boolean // compara arrays por longitud para no saturar logs
	label?: string // nombre del componente
}

export function useWhyDidYouUpdateValues<T extends Record<string, any>>(
	values: T,
	opts: Opts = {},
) {
	const prevRef = useRef<T | null>(null)

	useEffect(() => {
		if (!__DEV__) return
		const prev = prevRef.current
		if (prev) {
			const allKeys = new Set([...Object.keys(prev), ...Object.keys(values)])
			const changes: Record<string, { from: unknown; to: unknown }> = {}
			for (const k of allKeys) {
				const a = (prev as any)[k]
				const b = (values as any)[k]

				if (opts.shallowArrays && Array.isArray(a) && Array.isArray(b)) {
					if (a.length !== b.length) {
						changes[k] = { from: `len:${a.length}`, to: `len:${b.length}` }
					} else if (a !== b) {
						changes[k] = { from: 'same-len-ref', to: 'same-len-ref' }
					}
					continue
				}

				if (a !== b) changes[k] = { from: a, to: b }
			}
			if (Object.keys(changes).length) {
				console.log(
					`[WhyDidYouUpdateValues][${opts.label ?? 'Component'}]`,
					changes,
				)
			}
		}
		prevRef.current = values
	})
}
