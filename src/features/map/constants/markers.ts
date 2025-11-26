export const MAX_VISIBLE_POINTS_LOW_ZOOM = 800 // Límite de puntos en zoom bajo (optimizado)

// ✅ NUEVA ESTRATEGIA - Constantes de recálculo optimizadas
export const ZOOM_RECALC_THRESHOLD = 1 // Recalcular solo si zoom cambia >= 1 unidad entera
export const ZOOM_NO_BOUNDS_RECALC = 13 // Con zoom < 13, NO recalcular por cambios de bounds
export const BOUNDS_AREA_CHANGE_PERCENT = 15 // % de cambio de área para recalcular bounds
export const MIN_CONTAINERS_STABLE = 50 // Si hay < 50 contenedores, mantener estables (no recalcular por bounds)

// Constantes para cache
export const BINS_CACHE_DURATION_MS = 5 * 60 * 1000 // 5 minutos

export const CHUNK_SIZE = 750

export const DEFAULT_NEIGHBORHOOD = 'unknown'

// Constantes para marcadores
export const BIN_MARKER_ICON_SIZE = 16 // Tamaño del icono del marcador
export const HERO_MARKER_SIZE = 56 // Tamaño del marcador hero (14 * 4 = 56)
export const HERO_MARKER_ELEVATION = 8 // Elevación del marcador hero
export const HERO_MARKER_BORDER_WIDTH = 2 // Ancho del borde del marcador hero
export const HERO_MARKER_BORDER_COLOR = '#ffffff' // Color del borde del marcador hero
export const HERO_MARKER_BORDER_RADIUS = 9999 // Radio del borde del marcador hero
export const HERO_MARKER_SHADOW_RADIUS = 8 // Radio de sombra del marcador hero
export const HERO_MARKER_SHADOW_OPACITY = 0.25 // Opacidad de sombra del marcador hero
export const HERO_MARKER_TRIANGLE_MARGIN_TOP = -6 // Margen superior del triángulo
export const HERO_MARKER_TRIANGLE_MARGIN_BOTTOM = -10 // Margen inferior del triángulo
export const HERO_MARKER_TRIANGLE_SIZE = 8 // Tamaño del triángulo del marcador hero
