import type { IconSvgElement } from '@hugeicons/react-native'

export interface CustomButtonProps {
  id: string
	title: string
	mode?: 'primary' | 'secondary' | 'tertiary'
	flavor: 'button' | 'chip'
	size?: 'small' | 'medium' | 'large'
	isSelected?: boolean
	icon?: IconSvgElement
	iconSelected?: IconSvgElement
  disabled?: boolean
  loading?: boolean
	onPress: () => void
	onPressIn?: () => void
  onPressOut?: () => void
  testID?: string
}
