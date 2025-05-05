import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
}

const HeaderSearchBar: React.FC<HeaderSearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search properties...',
}) => {
  return (
    <View style={styles.container}>
      <Ionicons
        name="search-outline"
        size={20}
        color="#6B7280"
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#9CA3AF"
        returnKeyType="search" // Optional: improves keyboard
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value !== '' && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1, // Take available space
    alignItems: 'center',
    backgroundColor: '#F3F4F6', // Use a slightly different bg for header search
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38, // Adjust height as needed
    // Remove marginRight if headerRight provides spacing
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    paddingVertical: 0, // Remove default padding
  },
  clearButton: {
    paddingLeft: 8,
  },
});

export default HeaderSearchBar;
