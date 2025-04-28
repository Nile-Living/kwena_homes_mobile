import { View, TextInput, StyleSheet, TouchableOpacity, useColorScheme} from 'react-native';
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
  const colorScheme = useColorScheme();
  return (
    <View className="flex-1 flex flex-row p-1" style={styles.container}>
      <View style={[
        styles.searchContainer, 
        { 
          backgroundColor: colorScheme === 'dark' ? '#1e293b' : '#f3f4f6',
          borderColor: colorScheme === 'dark' ? '#334155' : '#d1d5db',
        }
      ]}>
        <Ionicons 
          name='search' 
          size={20} 
          color={colorScheme === 'dark' ? '#94a3b8' : '#4b5563'}
        />
        <TextInput 
          style={[
            styles.input,
            {
              color: colorScheme === 'dark' ? '#f1f5f9' : '#1f2937',
            }
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colorScheme === 'dark' ? '#94a3b8' : '#6b7280'}
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
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
  },

  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
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