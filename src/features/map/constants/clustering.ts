// Constantes para clustering y rendimiento
export const CLUSTER_RADIUS = 72 // Radio para clustering (ajustado para mayor estabilidad visual)
export const CLUSTER_MAX_ZOOM = 13 // Zoom máximo donde supercluster genera clusters
export const CLUSTER_MIN_ZOOM = 0 // Zoom mínimo donde supercluster genera clusters
export const CLUSTER_USE_UNTIL_ZOOM = 13 // Zoom hasta el cual usar supercluster - debe ser igual a CLUSTER_MAX_ZOOM
export const MIN_CLUSTER_SIZE = 10 // Tamaño mínimo para mantener como cluster (reduce mini-clusters)

// Constantes para expansión de clusters
export const LARGE_CLUSTER_ZOOM = 15 // Zoom fijo para todos los clusters - debe ser > CLUSTER_MAX_ZOOM (13)
export const MAX_VISIBLE_POINTS_LOW_ZOOM = 800 // Límite de puntos en zoom bajo (optimizado)
export const MAX_VISIBLE_POINTS_HIGH_ZOOM = 1000 // Límite de puntos en zoom alto (aumentado para evitar que desaparezcan contenedores)
export const VIEWPORT_BUFFER = 0.015 // Buffer para filtrado de viewport (aumentado para cubrir CENTRO)

// Constantes para supercluster
export const SUPERCLUSTER_EXTENT = 512 // Estándar para tiles de 512px
export const SUPERCLUSTER_NODE_SIZE = 64 // Optimizado para rendimiento

// Constantes para zoom levels
export const DEFAULT_ZOOM_FALLBACK = 13 // Zoom por defecto si no hay zoom válido

// ✅ NUEVA ESTRATEGIA - Constantes de recálculo optimizadas
export const ZOOM_RECALC_THRESHOLD = 1 // Recalcular solo si zoom cambia >= 1 unidad entera
export const ZOOM_NO_BOUNDS_RECALC = 13 // Con zoom < 13, NO recalcular por cambios de bounds
export const BOUNDS_AREA_CHANGE_PERCENT = 15 // % de cambio de área para recalcular bounds
export const MIN_CONTAINERS_STABLE = 50 // Si hay < 50 contenedores, mantener estables (no recalcular por bounds)

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
