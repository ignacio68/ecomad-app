import { HugeiconsIcon } from '@hugeicons/react-native'
import { ActivityIndicator, Pressable, Text } from 'react-native'
import { CustomButtonProps } from './types'

export const CustomButton = ({
	title,
	mode,
	flavor,
	size,
	icon,
	iconSelected,
	isSelected = false,
	disabled = false,
	loading = false,
	onPress,
	onPressIn,
	onPressOut,
}: CustomButtonProps) => {
	const getSize = () => {
		if (flavor === 'chip') {
			return `h-10 pl-2 pr-4`
		} else {
			switch (size) {
				case 'large':
					return `h-14 px-5`
				case 'medium':
					return `h-10 px-4`
				case 'small':
					return `h-8 px-3`
			}
		}
	}

	const getRounded = () => {
		switch (flavor) {
			case 'button':
				return `rounded-md`
			case 'chip':
				return `rounded-full`
		}
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
		if (flavor === 'chip') {
			return `mr-2`
		} else {
			switch (size) {
				case 'large':
					return `w-6 h-6 `
				case 'medium':
					return `w-5 h-5`
				case 'small':
					return `w-4 h-4`
			}
		}
	}

	const getIconColor = () => (isSelected ? 'white' : '#0074d9')

	const getTextSize = () => {
		if (flavor === 'chip') {
			return 'text-sm ml-2'
		} else {
			switch (size) {
				case 'large':
					return 'text-lg ml-2'
				case 'medium':
					return 'text-base ml-2'
				case 'small':
					return 'text-sm ml-1.5'
			}
		}
	}

	const getTextColor = () => {
		switch (mode) {
			case 'primary':
				return isSelected ? 'text-white' : 'text-secondary'
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

	const getSpinnerSize = () => {
		if (flavor === 'chip') return 'small'
		switch (size) {
			case 'large':
				return 'large'
			case 'medium':
				return 'small'
			case 'small':
				return 'small'
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
			{loading ? (
				<ActivityIndicator
					size={getSpinnerSize()}
					color={getSpinnerColor()}
					accessibilityLabel="Indicador de carga"
				/>
			) : (
				<>
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
				</>
			)}
		</Pressable>
	)
}
