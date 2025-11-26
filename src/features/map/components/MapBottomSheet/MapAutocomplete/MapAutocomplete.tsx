import { BottomSheetTextInput } from '@gorhom/bottom-sheet'
import {
	Cancel01Icon,
	Search01Icon as MagnifyingGlassIcon,
} from '@hugeicons-pro/core-stroke-rounded'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { getAutocompletedirections } from '@map/services/autocompleteServices'
import { useRef, useState } from 'react'
import { Pressable, View } from 'react-native'

const MapAutocomplete = () => {
	const [searchText, setSearchText] = useState<string>('')
	const inputRef = useRef<{ clear?: () => void } | null>(null)
	const setInputRef = (instance: any) => {
		inputRef.current = instance
	}

	const handleSearchText = (text: string) => {
		setSearchText(text)
	}

	const handleSubmit = () => {
		getAutocompletedirections(searchText)
	}

	const clearSearchText = () => {
		setSearchText('')
		inputRef.current?.clear?.()
	}
	return (
		<View className="mb-4 w-full flex-1 flex-row items-center rounded-full border-[1px] border-gray-200 bg-gray-100 px-3 py-2">
			<HugeiconsIcon
				icon={MagnifyingGlassIcon}
				size={16}
				color="#111111"
				strokeWidth={2}
				testID={`MagnifyingGlassIcon`}
			/>
			<BottomSheetTextInput
				ref={setInputRef}
				className=" mx-2 flex-1 py-2 font-lato-regular text-xl leading-6 text-gray-900"
				textAlign="left"
				placeholder="Introduce una dirección"
				placeholderTextColor="#9e9e9e"
				value={searchText}
				onChangeText={handleSearchText}
				onSubmitEditing={handleSubmit}
				textAlignVertical="center"
				allowFontScaling={true}
				clearTextOnFocus={true}
				contextMenuHidden={true}
				autoComplete="street-address"
				enterKeyHint="search"
				maxLength={100}
				numberOfLines={1}
				multiline={false}
				scrollEnabled={false}
				selectTextOnFocus={true}
			/>
			{searchText.length > 0 && (
				<Pressable
					onPress={clearSearchText}
					className="ml-2 rounded-full bg-white p-2"
				>
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

export default MapAutocomplete
