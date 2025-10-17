import { LngLatBounds } from '../types/mapData'

// Constantes para clustering y rendimiento
export const CLUSTER_RADIUS = 80 // Radio para clustering (reducido para crear más clusters)
export const CLUSTER_MAX_ZOOM = 13 // Zoom máximo donde supercluster genera clusters
export const CLUSTER_MIN_ZOOM = 0 // Zoom mínimo donde supercluster genera clusters
export const CLUSTER_USE_UNTIL_ZOOM = 13 // Zoom hasta el cual usar supercluster - debe ser igual a CLUSTER_MAX_ZOOM
export const MIN_CLUSTER_SIZE = 6 // Tamaño mínimo para mantener como cluster

// Constantes para expansión de clusters
export const LARGE_CLUSTER_ZOOM = 15 // Zoom fijo para todos los clusters - debe ser > CLUSTER_MAX_ZOOM (13)
export const MAX_VISIBLE_POINTS_LOW_ZOOM = 800 // Límite de puntos en zoom bajo (optimizado)
export const MAX_VISIBLE_POINTS_HIGH_ZOOM = 1000 // Límite de puntos en zoom alto (aumentado para evitar que desaparezcan contenedores)
export const HIGH_ZOOM_THRESHOLD = 14 // Umbral para considerar zoom alto
export const VIEWPORT_BUFFER = 0.015 // Buffer para filtrado de viewport (aumentado para cubrir CENTRO)

// Constantes para supercluster
export const SUPERCLUSTER_EXTENT = 512 // Estándar para tiles de 512px
export const SUPERCLUSTER_NODE_SIZE = 64 // Optimizado para rendimiento

// Constantes para bounds
export const WORLD_BOUNDS: LngLatBounds = [
	[-180, -85], // sw
	[180, 85], // ne
]

export const MADRID_BOUNDS: LngLatBounds = [
	[-4.5, 40.0], // sw
	[-3.0, 41.0], // ne
]

// Constantes para timeouts y throttling
export const ZOOM_THROTTLE_MS = 180 // Throttling más corto para zoom
export const LOAD_POINTS_TIMEOUT_MS = 10000 // Timeout para carga de puntos
export const ANIMATION_DURATION_MS = 800 // Duración de animaciones del mapa
export const ANIMATION_TIMEOUT_MS = 820 // Timeout para animaciones

// Constantes para zoom levels
export const DEFAULT_ZOOM_FALLBACK = 10 // Zoom por defecto si no hay zoom válido
export const ZOOM_CHANGE_THRESHOLD_OLD = 0.5 // Umbral antiguo (deprecated)

// ✅ NUEVA ESTRATEGIA - Constantes de recálculo optimizadas
export const ZOOM_RECALC_THRESHOLD = 1 // Recalcular solo si zoom cambia >= 1 unidad entera
export const ZOOM_NO_BOUNDS_RECALC = 10 // Con zoom < 13, NO recalcular por cambios de bounds
export const BOUNDS_AREA_CHANGE_PERCENT = 15 // % de cambio de área para recalcular bounds
export const MIN_CONTAINERS_STABLE = 50 // Si hay < 50 contenedores, mantener estables (no recalcular por bounds)

// Delays para recálculo
export const ZOOM_CHANGE_DELAY_MS = 0 // Sin delay para cambios de zoom
export const BOUNDS_CHANGE_DELAY_MS = 50 // Delay para cambios de bounds (debounce)

// Constantes para geolocalización
export const MOVEMENT_THRESHOLD_ZOOM_10 = 2000 // 2km - distritos
export const MOVEMENT_THRESHOLD_ZOOM_12 = 1000 // 1km - barrios
export const MOVEMENT_THRESHOLD_ZOOM_14 = 500 // 500m - transición
export const MOVEMENT_THRESHOLD_ZOOM_16 = 200 // 200m - contenedores
export const MOVEMENT_THRESHOLD_ZOOM_18 = 100 // 100m - zoom máximo
export const MOVEMENT_THRESHOLD_ZOOM_EXTREME = 50 // 50m - zoom extremo

// Constantes para coordenadas
export const COORDINATE_PRECISION = 1000 // Precisión para redondear coordenadas (~100m)
export const COORDINATE_DECIMALS = 3 // Decimales para mostrar coordenadas

// Constantes para UI
export const CLUSTER_SIZE_THRESHOLD_SMALL = 10 // Umbral para cluster pequeño
export const CLUSTER_SIZE_THRESHOLD_MEDIUM = 100 // Umbral para cluster mediano
export const CLUSTER_SIZE_THRESHOLD_LARGE = 100 // Umbral para cluster grande

// Constantes para cache
export const BINS_CACHE_DURATION_MS = 5 * 60 * 1000 // 5 minutos

// Constantes para marcadores
export const BIN_MARKER_ICON_SIZE = 16 // Tamaño del icono del marcador
export const HERO_MARKER_SIZE = 56 // Tamaño del marcador hero (14 * 4 = 56)
export const HERO_MARKER_ELEVATION = 12 // Elevación del marcador hero
export const HERO_MARKER_SHADOW_RADIUS = 8 // Radio de sombra del marcador hero
export const HERO_MARKER_SHADOW_OPACITY = 0.25 // Opacidad de sombra del marcador hero
export const HERO_MARKER_TRIANGLE_MARGIN_TOP = -6 // Margen superior del triángulo
export const HERO_MARKER_TRIANGLE_MARGIN_BOTTOM = -10 // Margen inferior del triángulo
