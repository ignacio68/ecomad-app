import { useEffect, useRef } from 'react'

export function useWhyDidYouUpdate<T extends object>(
	name: string,
	props: T,
	opts?: {
		ignore?: (keyof T)[]
		shallowArrays?: boolean
	},
) {
	const previousProps = useRef<T>(null)

	useEffect(() => {
		if (!__DEV__) return

		if (previousProps.current) {
			const allKeys = new Set([
				...Object.keys(previousProps.current),
				...Object.keys(props),
			])

			const changes: Record<string, { from: unknown; to: unknown }> = {}

			allKeys.forEach(key => {
				if (opts?.ignore?.includes(key as keyof T)) return

				const prevValue = (previousProps.current as any)[key]
				const nextValue = (props as any)[key]

				if (
					opts?.shallowArrays &&
					Array.isArray(prevValue) &&
					Array.isArray(nextValue)
				) {
					if (prevValue.length !== nextValue.length) {
						changes[key] = {
							from: `len:${prevValue.length}`,
							to: `len:${nextValue.length}`,
						}
					} else if (prevValue !== nextValue) {
						changes[key] = { from: 'same-len-ref', to: 'same-len-ref' }
					}
					return
				}

				if (prevValue !== nextValue) {
					changes[key] = { from: prevValue, to: nextValue }
				}
			})

			if (Object.keys(changes).length > 0) {
				console.log(`[WhyDidYouUpdate][${name}]`, changes)
			}
		}

		previousProps.current = props
	})
}
