import { View } from "react-native"
import { useState } from "react"
import { getAutocompletedirections } from '@map/services/autocompleteServices'
import SearchBar from './SearchBar'


const MapAutocomplete = () => {

  const [searchText, setSearchText] = useState<string>('')
  const [suggestions, setSuggestions] = useState<any[]>([])

  const handleSearchText = (text: string) => {
    setSearchText(text)
    console.log('SearchText', text)
  }

  const handleSubmit = () => {
    console.log('Submit')
    getAutocompletedirections(searchText)
  }

  const clearSearchText = () => {
    setSearchText('')
  }
  return (
    <View className="flex-1 w-full">
      <SearchBar placeholder="Introduce una dirección" value={searchText} onChangeText={handleSearchText} onSubmitEditing={handleSubmit} onClear={clearSearchText} />
    </View>
  )
}

export default MapAutocomplete