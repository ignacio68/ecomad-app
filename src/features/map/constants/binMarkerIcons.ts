import { BinType } from '@/shared/types/bins'
import {
	Apple01Icon as Apple01IconSolid,
	Book02Icon as Book02IconSolid,
	CardiganIcon as CardiganIconSolid,
	MilkBottleIcon as MilkBottleIconSolid,
	MilkCartonIcon as MilkCartonIconSolid,
	OilBarrelIcon as OilBarrelIconSolid,
	BatteryFullIcon as BatteryFullIconSolid,
	WasteRestoreIcon as WasteRestoreIconSolid,
} from '@hugeicons-pro/core-solid-rounded'
import { IconSvgElement } from '@hugeicons/react-native'

type BinMarkerIconSet = {
	default: string
	active: IconSvgElement
	color: string
	mediumColor: string
	highColor: string
}

export const BIN_MARKER_ICONS: Record<BinType, BinMarkerIconSet> = {
	clothing_bins: {
		default: require('@map/assets/icons/cardigan.png'),
		active: CardiganIconSolid,
		color: '#d3003b',
		mediumColor: '#9F002A',
		highColor: '#70001B',
	},
	oil_bins: {
		default: require('@map/assets/icons/oil-barrel.png'),
		active: OilBarrelIconSolid,
		color: '#F59E0B',
		mediumColor: '#09855C',
		highColor: '#056444',
	},
	glass_bins: {
		default: require('@map/assets/icons/milk-bottle.png'),
		active: MilkBottleIconSolid,
		color: '#10B981',
		mediumColor: '#059669',
		highColor: '#047857',
	},
	paper_bins: {
		default: require('@map/assets/icons/book-02.png'),
		active: Book02IconSolid,
		color: '#3B82F6',
		mediumColor: '#2168CD',
		highColor: '#174E9C',
	},
	plastic_bins: {
		default: require('@map/assets/icons/cardigan.png'),
		active: MilkCartonIconSolid,
		color: '#F6DD57',
		mediumColor: '#CEB948',
		highColor: '#AA993A',
	},
	organic_bins: {
		default: require('@map/assets/icons/apple-01.png'),
		active: Apple01IconSolid,
		color: '#A26B0B',
		mediumColor: '#825507',
		highColor: '#633F04',
	},
	battery_bins: {
		default: require('@map/assets/icons/battery-full.png'),
		active: BatteryFullIconSolid,
		color: '#817B87',
		mediumColor: '#67616C',
		highColor: '#64E4A52',
	},
	other_bins: {
		default: require('@map/assets/icons/waste-restore.png'),
		active: WasteRestoreIconSolid,
		color: '#7A49A0',
		mediumColor: '#613981',
		highColor: '#4B2B64',
	},
}
