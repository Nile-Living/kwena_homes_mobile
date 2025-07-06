import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const slateColors = {
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
};

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
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const handleTextChange = (text: string) => {
    onChangeText(text);
  };

  const handleClear = () => {
    onClear();
  };

  const containerBackgroundColor = isDarkMode ? slateColors[700] : '#F3F4F6';
  const iconColor = isDarkMode ? slateColors[400] : '#6B7280';
  const inputTextColor = isDarkMode ? slateColors[100] : '#1F2937';
  const placeholderTextColor = isDarkMode ? slateColors[400] : '#9CA3AF';
  const clearButtonColor = isDarkMode ? slateColors[400] : '#9CA3AF';

  const currentSearchValue = typeof value === 'string' ? value : '';

  return (
    <View style={[styles.container, { backgroundColor: containerBackgroundColor }]} testID="header-search-bar">
      <Ionicons
        name="search-outline"
        size={20}
        color={iconColor}
        style={styles.icon}
      />
      <TextInput
        style={[styles.input, { color: inputTextColor }]}
        placeholder={placeholder}
        value={currentSearchValue}
        onChangeText={handleTextChange}
        placeholderTextColor={placeholderTextColor}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        testID="search-input"
      />
      {currentSearchValue.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearButton}
          testID="clear-button"
        >
          <Ionicons name="close-circle" size={20} color={clearButtonColor} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: Platform.OS === 'ios' ? 36 : 40,
    width: '100%',
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
});

export default React.memo(HeaderSearchBar);
