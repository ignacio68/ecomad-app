import { TextInput, Pressable, View } from 'react-native'
import { HugeiconsIcon } from '@hugeicons/react-native'
import {
	Search01Icon as MagnifyingGlassIcon,
	Cancel01Icon,
} from '@hugeicons-pro/core-stroke-rounded'

interface SearchBarProps {
	placeholder: string
	value: string
	onChangeText: (text: string) => void
	onSubmitEditing: () => void
	onClear: () => void
}

export const SearchBar = ({
	placeholder,
	value,
	onChangeText,
	onSubmitEditing,
	onClear,
}: SearchBarProps) => {
	return (
		<View className="flex-1 flex-row items-center rounded-full border-[1px] border-gray-200 bg-gray-100 px-3 py-2">
			<HugeiconsIcon
				icon={MagnifyingGlassIcon}
				size={16}
				color="#111111"
				strokeWidth={2}
				testID={`MagnifyingGlassIcon`}
			/>
			<TextInput
				className="ml-2 flex-1 font-lato-regular text-xl text-gray-900"
				placeholder={placeholder}
				value={value}
				onChangeText={onChangeText}
				onSubmitEditing={onSubmitEditing}
				returnKeyType="search"
			/>
			{value.length > 0 && (
				<Pressable onPress={onClear} className="ml-2 rounded-full bg-white p-2">
					<HugeiconsIcon
						icon={Cancel01Icon}
						size={18}
						color="#111111"
						strokeWidth={2}
						testID={`CancelSearchIcon`}
					/>
				</Pressable>
			)}
		</View>
	)
}

export default SearchBar
