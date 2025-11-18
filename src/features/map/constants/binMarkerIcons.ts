import { BinType } from '@/shared/types/bins'
import {
	Apple01Icon as Apple01IconSolid,
	Book02Icon as Book02IconSolid,
	CardiganIcon as CardiganIconSolid,
	MilkBottleIcon as MilkBottleIconSolid,
	MilkCartonIcon as MilkCartonIconSolid,
	DatabaseRestoreIcon as DatabaseRestoreIconSolid,
	BatteryCharging01Icon as BatteryCharging01IconSolid,
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
		default: require('@map/assets/icons/clothing-bins-small.png'),
		active: CardiganIconSolid,
		color: '#d3003b',
		mediumColor: '#9F002A',
		highColor: '#70001B',
	},
	oil_bins: {
		default: require('@map/assets/icons/oil-bins-small.png'),
		active: DatabaseRestoreIconSolid,
		color: '#F59E0B',
		mediumColor: '#C27C07',
		highColor: '#8F5A04',
	},
	glass_bins: {
		default: require('@map/assets/icons/glass-bins-small.png'),
		active: MilkBottleIconSolid,
		color: '#10B981',
		mediumColor: '#059669',
		highColor: '#047857',
	},
	paper_bins: {
		default: require('@map/assets/icons/paper-bins-small.png'),
		active: Book02IconSolid,
		color: '#3B82F6',
		mediumColor: '#2168CD',
		highColor: '#174E9C',
	},
	plastic_bins: {
		default: require('@map/assets/icons/plastic-bins-small.png'),
		active: MilkCartonIconSolid,
		color: '#F6DD57',
		mediumColor: '#CEB948',
		highColor: '#AA993A',
	},
	organic_bins: {
		default: require('@map/assets/icons/organic-bins-small.png'),
		active: Apple01IconSolid,
		color: '#AD6F06',
		mediumColor: '#8B5804',
		highColor: '#684002',
	},
	battery_bins: {
		default: require('@map/assets/icons/battery-bins-small.png'),
		active: BatteryCharging01IconSolid,
		color: '#817B87',
		mediumColor: '#67616C',
		highColor: '#4E4A52',
	},
	other_bins: {
		default: require('@map/assets/icons/other-bins-small.png'),
		active: WasteRestoreIconSolid,
		color: '#7A49A0',
		mediumColor: '#613981',
		highColor: '#4B2B64',
	},
}
