import { BinType } from '@/shared/types/bins'
import {
	Apple01Icon,
	Book02Icon,
	CardiganIcon,
	MilkBottleIcon,
	MilkCartonIcon,
	OilBarrelIcon,
	WasteRestoreIcon,
} from '@hugeicons-pro/core-duotone-rounded'
import {
	Apple01Icon as Apple01IconSolid,
	Book02Icon as Book02IconSolid,
	CardiganIcon as CardiganIconSolid,
	MilkBottleIcon as MilkBottleIconSolid,
	MilkCartonIcon as MilkCartonIconSolid,
	OilBarrelIcon as OilBarrelIconSolid,
	WasteRestoreIcon as WasteRestoreIconSolid,
} from '@hugeicons-pro/core-solid-rounded'
import { IconSvgElement } from '@hugeicons/react-native'

type BinMarkerIconSet = {
	default: IconSvgElement
	active: IconSvgElement
	color: string
}

export const BIN_MARKER_ICONS: Record<BinType, BinMarkerIconSet> = {
	clothing_bins: {
		default: CardiganIcon,
		active: CardiganIconSolid,
		color: '#d3003b',
	},
	oil_bins: {
		default: OilBarrelIcon,
		active: OilBarrelIconSolid,
		color: '#F59E0B',
	},
	glass_bins: {
		default: MilkBottleIcon,
		active: MilkBottleIconSolid,
		color: '#10B981',
	},
	paper_bins: {
		default: Book02Icon,
		active: Book02IconSolid,
		color: '#3B82F6',
	},
	plastic_bins: {
		default: MilkCartonIcon,
		active: MilkCartonIconSolid,
		color: '#EF4444',
	},
	organic_bins: {
		default: Apple01Icon,
		active: Apple01IconSolid,
		color: '#84CC16',
	},
	other_bins: {
		default: WasteRestoreIcon,
		active: WasteRestoreIconSolid,
		color: '#6B7280',
	},
}
