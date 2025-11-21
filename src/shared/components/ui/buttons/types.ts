import type { IconSvgElement } from '@hugeicons/react-native'

export interface BaseButtonProps {

	title: string
	mode?: 'primary' | 'secondary' | 'tertiary'
	isSelected?: boolean
	icon?: IconSvgElement
	iconSelected?: IconSvgElement
	disabled?: boolean
	loading?: boolean
	bgColor?: string
	bgColorSelected?: string
	onPress: () => void
	testID?: string
}

export interface CustomButtonProps extends BaseButtonProps {
	size?: 'small' | 'medium' | 'large'
}

export interface ChipProps extends BaseButtonProps {
	hasSubcategories?: boolean
}
