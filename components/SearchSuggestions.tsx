import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { PROPERTY_TYPES, getAllAmenities } from '@/constants/propertyTypes';

interface SearchSuggestionsProps {
  searchQuery: string;
  onSuggestionPress: (suggestion: string) => void;
  visible: boolean;
}

export default function SearchSuggestions({ 
  searchQuery, 
  onSuggestionPress, 
  visible 
}: SearchSuggestionsProps) {
  if (!visible || !searchQuery.trim()) return null;

  const trimmedQuery = searchQuery.trim().toLowerCase();
  
  const suggestions: string[] = [];
  
  // Property type suggestions
  Object.entries(PROPERTY_TYPES).forEach(([key, value]) => {
    if (value.label.toLowerCase().includes(trimmedQuery)) {
      suggestions.push(value.label);
    }
  });
  
  // Amenity suggestions
  const allAmenities = getAllAmenities();
  allAmenities.forEach(amenity => {
    if (amenity.toLowerCase().includes(trimmedQuery) && !suggestions.includes(amenity)) {
      suggestions.push(amenity);
    }
  });
  
  // Property type suggestions
  if ('for rent'.includes(trimmedQuery)) suggestions.push('For Rent');
  if ('for sale'.includes(trimmedQuery)) suggestions.push('For Sale');
  
  const limitedSuggestions = suggestions.slice(0, 5);
  
  if (limitedSuggestions.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        data={limitedSuggestions}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.suggestionItem}
            onPress={() => onSuggestionPress(item)}
          >
            <Text style={styles.suggestionText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  suggestionText: {
    fontSize: 14,
    color: '#374151',
  },
});
