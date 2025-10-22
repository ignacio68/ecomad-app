// PerformanceOverlay.tsx
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor'

type Props = {
	visible?: boolean
	logEveryMs?: number
	bufferSize?: number
	position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

const PerformanceOverlay: React.FC<Props> = ({
	visible = true,
	logEveryMs = 0,
	bufferSize = 300,
	position = 'top-left',
}) => {
	const { fpsInstant, fpsAvg, fpsP95, rps } = usePerformanceMonitor({
		logEveryMs,
		bufferSize,
	})

	if (!visible) return null

	const pos = (() => {
		const base = { position: 'absolute' as const, margin: 12 }
		switch (position) {
			case 'top-right':
				return { ...base, top: 0, right: 0 }
			case 'bottom-left':
				return { ...base, bottom: 0, left: 0 }
			case 'bottom-right':
				return { ...base, bottom: 0, right: 0 }
			default:
				return { ...base, top: 0, left: 0 }
		}
	})()

	return (
		<View style={[styles.box, pos]}>
			<Text style={styles.title}>Performance</Text>
			<Text style={styles.row}>FPS (inst): {fpsInstant.toFixed(1)}</Text>
			<Text style={styles.row}>FPS (avg): {fpsAvg.toFixed(1)}</Text>
			<Text style={styles.row}>FPS (p95): {fpsP95.toFixed(1)}</Text>
			<Text style={styles.row}>RPS: {rps}</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	box: {
		backgroundColor: 'rgba(0,0,0,0.65)',
		borderRadius: 10,
		paddingVertical: 8,
		paddingHorizontal: 10,
	},
	title: {
		color: '#fff',
		fontWeight: '700',
		marginBottom: 4,
	},
	row: {
		color: '#fff',
		fontVariant: ['tabular-nums'],
	},
})


export default PerformanceOverlay