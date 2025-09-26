import { BinType } from '@/shared/types/bins'
import { HugeiconsIcon } from '@hugeicons/react-native'
import React from 'react'
import { Pressable, Text } from 'react-native'
import { BaseButtonProps } from './types'

export interface ChipProps extends BaseButtonProps {
	id: string
	endPoint: BinType
}
const Chip = React.memo(
	({
		id,
		title,
		mode,
		icon,
		iconSelected,
		endPoint,
		isSelected = false,
		disabled = false,
		loading = false,
		onPress,
	}: ChipProps) => {
		const getSize = () => {
			return `h-10 pl-2 pr-4`
		}

		const getRounded = () => {
			return `rounded-full`
		}

		const getColor = () => {
			switch (mode) {
				case 'primary':
					return isSelected ? 'bg-primary' : 'bg-white'
				case 'secondary':
					return isSelected ? 'bg-secondary' : 'bg-secondary-light'
				case 'tertiary':
					return isSelected ? 'bg-tertiary' : 'bg-tertiary-light'
			}
		}

		const getIcon = () => (isSelected ? iconSelected : icon)

		const getIconStyle = () => {
			return `mr-2`
		}

		const getIconColor = () => (isSelected ? 'white' : '#3d9970')

		const getTextSize = () => {
			return 'text-sm ml-2'
		}

		const getTextColor = () => {
			switch (mode) {
				case 'primary':
					return isSelected ? 'text-white' : 'text-primary'
				case 'secondary':
					return isSelected ? 'text-white' : 'text-secondary'
				case 'tertiary':
					return isSelected ? 'text-white' : 'text-tertiary'
			}
		}

		const getFontFamily = () =>
			isSelected ? 'font-lato-bold' : 'font-lato-semibold'

		const getSpinnerColor = () => {
			switch (mode) {
				case 'primary':
					return isSelected ? '#ffffff' : '#3d9970'
				case 'secondary':
					return isSelected ? '#ffffff' : '#0074d9'
				case 'tertiary':
					return isSelected ? '#ffffff' : '#111111'
			}
		}

		const getAccessibilityLabel = () => {
			if (loading) {
				return `${title} - Cargando`
			}
			if (disabled) {
				return `${title} - Deshabilitado`
			}
			if (isSelected) {
				return `${title} - Seleccionado`
			}
			return title
		}

		const getAccessibilityHint = () => {
			if (loading) {
				return 'Esperando respuesta del servidor'
			}
			if (disabled) {
				return 'Este botón no está disponible'
			}
			return `Presiona para ${title.toLowerCase()}`
		}

		return (
			<Pressable
				onPress={onPress}
				disabled={disabled || loading}
				className={`flex-1 flex-row items-center justify-center shadow-xl ${getSize()} ${getRounded()} ${getColor()}`}
				accessibilityRole="button"
				accessibilityLabel={getAccessibilityLabel()}
				accessibilityHint={getAccessibilityHint()}
				accessibilityState={{
					disabled: disabled || loading,
					selected: isSelected,
					busy: loading,
				}}
				accessibilityLiveRegion={loading ? 'polite' : undefined}
			>
				{icon && (
					<HugeiconsIcon
						icon={getIcon()}
						className={`${getIconStyle()}`}
						size={20}
						color={getIconColor()}
						accessibilityLabel={`Icono de ${title}`}
					/>
				)}
				<Text
					className={`${getTextColor()} ${getTextSize()} ${getFontFamily()}`}
					accessibilityRole="text"
				>
					{title}
				</Text>
			</Pressable>
		)
	},
)

export default Chip
