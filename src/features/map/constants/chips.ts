import { RestoreBinIcon, BicycleIcon, Tree02Icon, Car04Icon } from '@hugeicons-pro/core-stroke-rounded'
import { RestoreBinIcon as RestoreBinIconSolid, BicycleIcon as BicycleIconSolid, Tree02Icon as Tree02IconSolid, Car04Icon as Car04IconSolid } from '@hugeicons-pro/core-solid-rounded'
import { CustomButtonProps } from '@/components/ui/CustomButton/types'
export const CHIPS_LIST: CustomButtonProps[] = [
	{
		id: 'reciclaje',
    title: 'Reciclaje',
    mode: 'primary',
    flavor: 'chip',
    icon: RestoreBinIcon,
    iconSelected: RestoreBinIconSolid,
    onPress: () => {
      console.log('Contenedores')
    },
  },
  {
    id: 'ocio',
    title: 'Ocio',
    mode: 'primary',
    flavor: 'button',
    size: 'large',
    icon: Tree02Icon,
    iconSelected: Tree02IconSolid,
    onPress: () => {
      console.log('Ocio')
    },
  },
  {
    id: 'bicis',
    title: 'Bicis',
    mode: 'primary',
    flavor: 'chip',
    icon: BicycleIcon,
    iconSelected: BicycleIconSolid,
    onPress: () => {
      console.log('Bicis')
    },
  },
  {
    id: 'coches',
    title: 'Coches',
    mode: 'primary',
    flavor: 'chip',
    icon: Car04Icon,
    iconSelected: Car04IconSolid,
    onPress: () => {
      console.log('Coches')
    },
  },
  {
    id: 'otros',
    title: 'Otros',
    mode: 'primary',
    flavor: 'chip',
    icon: Car04Icon,
    iconSelected: Car04IconSolid,
    onPress: () => {
      console.log('Coches')
    },
  }
]
