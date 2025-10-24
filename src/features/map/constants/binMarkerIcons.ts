import { BinType } from '@/shared/types/bins'

type BinMarkerIconSet = {
	default: string // Ruta del SVG duotone
	active: string // Ruta del SVG solid
	color: string
}

export const BIN_MARKER_ICONS: Record<BinType, BinMarkerIconSet> = {
	clothing_bins: {
		default: require('@map/assets/icons/cardigan.png'),
		active: require('@map/assets/icons/cardigan-selected.png'),
		color: '#d3003b',
	},
	oil_bins: {
		default: require('@map/assets/svg/oil-barrel-duotone-rounded.svg'),
		active: require('@map/assets/svg/oil-barrel-bulk-rounded.svg'),
		color: '#F59E0B',
	},
	glass_bins: {
		default: require('@map/assets/svg/milk-bottle-duotone-rounded.svg'),
		active: require('@map/assets/svg/milk-bottle-solid-rounded.svg'),
		color: '#10B981',
	},
	paper_bins: {
		default: require('@map/assets/svg/book-02-duotone-rounded.svg'),
		active: require('@map/assets/svg/book-02-solid-rounded.svg'),
		color: '#3B82F6',
	},
	plastic_bins: {
		default: require('@map/assets/svg/milk-carton-duotone-rounded.svg'),
		active: require('@map/assets/svg/milk-carton-solid-rounded.svg'),
		color: '#EF4444',
	},
	organic_bins: {
		default: require('@map/assets/svg/apple-01-duotone-rounded.svg'),
		active: require('@map/assets/svg/apple-01-solid-rounded.svg'),
		color: '#84CC16',
	},
	other_bins: {
		default: require('@map/assets/svg/waste-restore-duotone-rounded.svg'),
		active: require('@map/assets/svg/waste-restore-solid-rounded.svg'),
		color: '#6B7280',
	},
}
