import { BinType } from '@/shared/types/bins'
import { IconSvgElement } from '@hugeicons/react-native'
import {
	Apple01Icon as Apple01IconSolid,
	Book02Icon as Book02IconSolid,
	CardiganIcon as CardiganIconSolid,
	MilkBottleIcon as MilkBottleIconSolid,
	MilkCartonIcon as MilkCartonIconSolid,
	OilBarrelIcon as OilBarrelIconSolid,
	WasteRestoreIcon as WasteRestoreIconSolid,
} from '@hugeicons-pro/core-solid-rounded'

type BinMarkerIconSet = {
	default: string
	active: IconSvgElement
	color: string
}

export const BIN_MARKER_ICONS: Record<BinType, BinMarkerIconSet> = {
	clothing_bins: {
		default: require('@map/assets/icons/cardigan.png'),
		active: CardiganIconSolid,
		color: '#d3003b',
	},
	oil_bins: {
		default: require('@map/assets/svg/oil-barrel-duotone-rounded.svg'),
		active: OilBarrelIconSolid,
		color: '#F59E0B',
	},
	glass_bins: {
		default: require('@map/assets/svg/milk-bottle-duotone-rounded.svg'),
		active: MilkBottleIconSolid,
		color: '#10B981',
	},
	paper_bins: {
		default: require('@map/assets/svg/book-02-duotone-rounded.svg'),
		active: Book02IconSolid,
		color: '#3B82F6',
	},
	plastic_bins: {
		default: require('@map/assets/svg/milk-carton-duotone-rounded.svg'),
		active: MilkCartonIconSolid,
		color: '#EF4444',
	},
	organic_bins: {
		default: require('@map/assets/svg/apple-01-duotone-rounded.svg'),
		active: Apple01IconSolid,
		color: '#84CC16',
	},
	other_bins: {
		default: require('@map/assets/svg/waste-restore-duotone-rounded.svg'),
		active: WasteRestoreIconSolid,
		color: '#6B7280',
	},
}
