import { View, TextInput, StyleSheet, TouchableOpacity} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilter?: () => void;
}


export default function SearchBar({
  value,
  onChangeText,
  placeholder,
  onFilter
}: SearchBarProps) {
  return (
    <View className="flex-1 flex flex-row p-1" style={styles.container}>
      <View style={styles.searchContainer} className='border border-gray-500'>
        <Ionicons name='search' size={20} color="#666"/>
        <TextInput 
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#666"
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },

  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    
  },

  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#244835'
  },

  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  }
})