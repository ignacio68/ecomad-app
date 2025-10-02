import { LngLatBounds } from '../types/mapData'

// Constantes para clustering y rendimiento
export const CLUSTER_RADIUS = 120 // Radio para clustering (aumentado para mejor agrupación)
export const CLUSTER_MAX_ZOOM = 16 // Zoom máximo donde supercluster genera clusters (aumentado para zoom programático)
export const CLUSTER_USE_UNTIL_ZOOM = 17 // Zoom hasta el cual usar supercluster
export const MIN_CLUSTER_SIZE = 6 // Tamaño mínimo para mantener como cluster
export const MAX_VISIBLE_POINTS_LOW_ZOOM = 800 // Límite de puntos en zoom bajo
export const MAX_VISIBLE_POINTS_HIGH_ZOOM = 500 // Límite de puntos en zoom alto
export const HIGH_ZOOM_THRESHOLD = 14 // Umbral para considerar zoom alto
export const VIEWPORT_BUFFER = 0.002 // Buffer para filtrado de viewport

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
export const ZOOM_CHANGE_THRESHOLD = 0.5 // Umbral para detectar cambios de zoom significativos

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

// Constantes para geolocalización del usuario
export const USER_LOCATION_TIME_INTERVAL_MS = 1000 // Intervalo de tiempo para geolocalización
export const USER_LOCATION_DISTANCE_INTERVAL_M = 5 // Intervalo de distancia para geolocalización

// Constantes para UI
export const COMPASS_POSITION = { top: 240, right: 14 } // Posición del compás

// Constantes para bottom sheet
export const BOTTOM_SHEET_SNAP_POINTS = ['25%', '80%'] // Puntos de snap del bottom sheet

// Constantes para marcadores
export const BIN_MARKER_ICON_SIZE = 16 // Tamaño del icono del marcador
export const HERO_MARKER_SIZE = 56 // Tamaño del marcador hero (14 * 4 = 56)
export const HERO_MARKER_ELEVATION = 12 // Elevación del marcador hero
export const HERO_MARKER_SHADOW_RADIUS = 8 // Radio de sombra del marcador hero
export const HERO_MARKER_SHADOW_OPACITY = 0.25 // Opacidad de sombra del marcador hero
export const HERO_MARKER_TRIANGLE_MARGIN_TOP = -6 // Margen superior del triángulo
export const HERO_MARKER_TRIANGLE_MARGIN_BOTTOM = -10 // Margen inferior del triángulo
