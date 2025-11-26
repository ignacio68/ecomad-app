import { RestoreBinIcon as RestoreBinIconDuotone } from '@hugeicons-pro/core-duotone-rounded'
import type { IconSvgElement } from '@hugeicons/react-native'

export interface Category {
	id: string
	label: string
	title: string
	subcategories: Subcategory[]
}

export interface Subcategory {
	id: string
	label: string
	title: string
	icon: IconSvgElement
	color: string
}

export const CATEGORIES: Category[] = [
	{
		id: '1',
		label: 'Recycling_bins',
		title: 'Contenedores',
		subcategories: [
			{
				id: '11',
				label: 'Glass recycling bins',
				title: 'Vidrio',
				icon: RestoreBinIconDuotone,
				color: 'green',
			},
			{
				id: '12',
				label: 'Paper recycling bins',
				title: 'Papel',
				icon: RestoreBinIconDuotone,
				color: 'blue',
			},
			{
				id: '13',
				label: 'Plastic recycling bins',
				title: 'Plástico',
				icon: RestoreBinIconDuotone,
				color: 'yellow',
			},
		],
	},
]
