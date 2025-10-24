import { useEffect, useMemo, useRef } from 'react'
import { Easing } from 'react-native' // opcional
import { CircleLayer, Images, ShapeSource, SymbolLayer } from '@rnmapbox/maps'
import { BinType } from '@/shared/types/bins'
import { BIN_MARKER_ICONS } from '@map/constants/binMarkerIcons'
import { HERO_MARKER_SIZE } from '@map/constants/clustering'

interface MapHeroMarkerProps {
	coordinate: [number, number]
	binType: BinType
	onPress?: () => void
	id?: string // recomendable para no colisionar IDs si hay varios
}

const MapHeroMarker = ({
	coordinate,
	binType,
	onPress,
	id = `hero-${binType}-${coordinate.join(',')}`,
}: MapHeroMarkerProps) => {
	const { color, active: ActiveIcon } = BIN_MARKER_ICONS[binType]

	// Refs a los layers para setNativeProps
	const pulseRef = useRef<any>(null)
	const circleRef = useRef<any>(null)
	const iconRef = useRef<any>(null)

	// GeoJSON fijo (no lo tocaremos para evitar flicker)
	const heroGeoJSON = useMemo(
		() => ({
			type: 'FeatureCollection' as const,
			features: [
				{
					type: 'Feature' as const,
					geometry: {
						type: 'Point' as const,
						coordinates: coordinate,
					},
					properties: { binType, color },
				},
			],
		}),
		[coordinate, binType, color],
	)

	// ------ Animación de entrada (pop-in + fade) ------
	useEffect(() => {
		const start = Date.now()
		const D = 350 // ms
		let raf = 0

		const tick = () => {
			const t = Math.min(1, (Date.now() - start) / D)
			// easing suave (spring-like approximado)
			const eased = Easing.out(Easing.cubic)(t)

			const circleRadius = (HERO_MARKER_SIZE / 2) * eased
			const circleOpacity = eased
			const iconSize = .8 * eased
			const iconOpacity = eased

			// Capa del círculo principal
			circleRef.current?.setNativeProps({
				style: {
					// Ojo: las expresiones/arrays nunca deben ser vacías
					circleRadius,
					circleColor: color,
					circleStrokeWidth: 3,
					circleStrokeColor: '#ffffff',
					circleOpacity,
				},
			})

			// Capa del icono
			iconRef.current?.setNativeProps({
				style: {
					iconImage: 'hero-icon-' + id, // lo definimos abajo en <Images/>
					iconSize,
					iconAllowOverlap: true,
					iconIgnorePlacement: true,
					iconOpacity,
				},
			})

			if (t < 1) {
				raf = requestAnimationFrame(tick)
			}
		}

		raf = requestAnimationFrame(tick)
		return () => cancelAnimationFrame(raf)
	}, [color, id])

	// ------ Pulso continuo (anillo que crece y se desvanece) ------
	useEffect(() => {
		let raf = 0
		let t = 0

		const loop = () => {
			t += 0.02 // velocidad del pulso
			// multiplica el radio entre 1x y 1.8x y hace fade out
			const mult = 1 + 0.8 * Math.abs(Math.sin(t))
			const base = 32 // radio base del pulso
			const r = base * mult
			// opacidad en triangulo: sube y baja (evita 0 puro para no problemas)
			const o = Math.max(0, 0.4 - (mult - 1) * 0.4) // 0.4 → 0

			pulseRef.current?.setNativeProps({
				style: {
					circleRadius: r,
					circleColor: color,
					circleOpacity: o,
				},
			})
			raf = requestAnimationFrame(loop)
		}
		raf = requestAnimationFrame(loop)
		return () => cancelAnimationFrame(raf)
	}, [color])

	return (
		<>
			<Images
				images={{
					['hero-icon-' + id]: ActiveIcon,
				}}
			/>

			<ShapeSource
				id={`hero-src-${id}`}
				shape={heroGeoJSON}
				onPress={onPress}
				hitbox={{ width: 40, height: 40 }}
			>
				{/* Pulso */}
				<CircleLayer
					ref={pulseRef}
					id={`hero-pulse-${id}`}
					style={{
						circleRadius: 1, // valores iniciales válidos
						circleColor: color,
						circleOpacity: 0,
					}}
				/>

				{/* Círculo principal (pop-in) */}
				<CircleLayer
					ref={circleRef}
					id={`hero-circle-${id}`}
					style={{
						circleRadius: 0, // arranca en 0 → sube en efecto
						circleColor: color,
						circleStrokeWidth: 3,
						circleStrokeColor: '#ffffff',
						circleOpacity: 0,
					}}
				/>

				{/* Icono (pop-in) */}
				<SymbolLayer
					ref={iconRef}
					id={`hero-icon-${id}`}
					style={{
						iconImage: 'hero-icon-' + id,
						iconSize: 0, // arranca en 0 → sube en efecto
						iconAllowOverlap: true,
						iconIgnorePlacement: true,
						iconOpacity: 0,
					}}
				/>
			</ShapeSource>
		</>
	)
}

export default MapHeroMarker
