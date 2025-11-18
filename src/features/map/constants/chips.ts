import { ChipProps } from '@/shared/components/ui/buttons/Chip'

import {
	Apple01Icon,
	Book02Icon,
	CardiganIcon,
	MilkBottleIcon,
	MilkCartonIcon,
	DatabaseRestoreIcon,
	WasteRestoreIcon,
	BatteryEmptyIcon,
} from '@hugeicons-pro/core-duotone-rounded'
import {
	Apple01Icon as Apple01IconSolid,
	Book02Icon as Book02IconSolid,
	CardiganIcon as CardiganIconSolid,
	MilkBottleIcon as MilkBottleIconSolid,
	MilkCartonIcon as MilkCartonIconSolid,
	DatabaseRestoreIcon as DatabaseRestoreIconSolid,
	WasteRestoreIcon as WasteRestoreIconSolid,
	BatteryEmptyIcon as BatteryEmptyIconSolid,
} from '@hugeicons-pro/core-solid-rounded'

export const createChipsList = (): ChipProps[] => [
	{
		id: 'clothing',
		title: 'Ropa',
		mode: 'primary',
		icon: CardiganIcon,
		iconSelected: CardiganIconSolid,
		endPoint: 'clothing_bins',
		onPress: () => {},
	},
	{
		id: 'oil',
		title: 'Aceite',
		mode: 'primary',
		icon: DatabaseRestoreIcon,
		iconSelected: DatabaseRestoreIconSolid,
		endPoint: 'oil_bins',
		onPress: () => {},
	},
	{
		id: 'glass',
		title: 'Vidrio',
		mode: 'primary',
		icon: MilkBottleIcon,
		iconSelected: MilkBottleIconSolid,
		endPoint: 'glass_bins',
		onPress: () => {},
	},
	{
		id: 'paper',
		title: 'Papel',
		mode: 'primary',
		icon: Book02Icon,
		iconSelected: Book02IconSolid,
		endPoint: 'paper_bins',
		onPress: () => {},
	},
	{
		id: 'plastic',
		title: 'Envases',
		mode: 'primary',
		icon: MilkCartonIcon,
		iconSelected: MilkCartonIconSolid,
		endPoint: 'plastic_bins',
		onPress: () => {},
	},
	{
		id: 'organic',
		title: 'Orgánico',
		mode: 'primary',
		icon: Apple01Icon,
		iconSelected: Apple01IconSolid,
		endPoint: 'organic_bins',
		onPress: () => {},
	},
	{
		id: 'battery',
		title: 'Pilas',
		mode: 'primary',
		icon: BatteryEmptyIcon,
		iconSelected: BatteryEmptyIconSolid,
		endPoint: 'battery_bins',
		onPress: () => {},
	},
	{
		id: 'other',
		title: 'Resto',
		mode: 'primary',
		icon: WasteRestoreIcon,
		iconSelected: WasteRestoreIconSolid,
		endPoint: 'other_bins',
		onPress: () => {},
	},
]

export const CHIPS_LIST: ChipProps[] = createChipsList()
