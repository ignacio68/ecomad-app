import { BaseButtonProps } from '@/shared/components/ui/buttons/types'

import {
	Book02Icon as Book02IconSolid,
	// BicycleIcon as BicycleIconSolid,
	// Car04Icon as Car04IconSolid,
	CardiganIcon as CardiganIconSolid,
	MilkBottleIcon as MilkBottleIconSolid,
	OilBarrelIcon as OilBarrelIconSolid,
	MilkCartonIcon as MilkCartonIconSolid,
} from '@hugeicons-pro/core-solid-rounded'
import {
	Book02Icon,
	// BicycleIcon,
	// Car04Icon,
	CardiganIcon,
	MilkBottleIcon,
	OilBarrelIcon,
	MilkCartonIcon,
} from '@hugeicons-pro/core-duotone-rounded'

export const createChipsList = (): BaseButtonProps[] => [
	{
		id: 'clothes',
		title: 'Ropa',
		mode: 'primary',
		icon: CardiganIcon,
		iconSelected: CardiganIconSolid,
		onPress: () => {},
	},
	{
		id: 'oil',
		title: 'Aceite',
		mode: 'primary',
		icon: OilBarrelIcon,
		iconSelected: OilBarrelIconSolid,
		onPress: () => {},
	},
	{
		id: 'glass',
		title: 'Vidrio',
		mode: 'primary',
		icon: MilkBottleIcon,
		iconSelected: MilkBottleIconSolid,
		onPress: () => {},
	},
	{
		id: 'paper',
		title: 'Papel',
		mode: 'primary',
		icon: Book02Icon,
		iconSelected: Book02IconSolid,
		onPress: () => {},
	},
	{
		id: 'plastic',
		title: 'Envases',
		mode: 'primary',
		icon: MilkCartonIcon,
		iconSelected: MilkCartonIconSolid,
		onPress: () => {},
	},

]

export const CHIPS_LIST: BaseButtonProps[] = createChipsList()
