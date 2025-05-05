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
  const handleTextChange = (text: string) => {
    console.log('Text changed:', text);
    onChangeText(text);
  };

  const handleClear = () => {
    console.log('Clear pressed');
    onClear();
  };

  return (
    <View style={styles.container} testID="header-search-bar">
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
        onChangeText={handleTextChange}
        placeholderTextColor="#9CA3AF"
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        testID="search-input"
      />
      {value !== '' && (
        <TouchableOpacity 
          onPress={handleClear}
          style={styles.clearButton}
          testID="clear-button"
        >
          <Ionicons name="close-circle" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    width: '100%',
    maxWidth: 280,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    height: '100%',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
});

export default React.memo(HeaderSearchBar);
