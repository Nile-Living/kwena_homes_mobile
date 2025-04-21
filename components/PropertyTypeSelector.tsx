// components/PropertyTypeSelector.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { PROPERTY_TYPES, PropertyType } from '../constants/PropertyTypes';

interface PropertyTypeSelectorProps {
  value: PropertyType;
  onChange: (value: PropertyType) => void;
}

export function PropertyTypeSelector({ value, onChange }: PropertyTypeSelectorProps) {
  return (
    <View className="mb-4">
      <Text className="text-base font-semibold mb-2">Property Type</Text>
      <View className="border border-gray-200 rounded">
        <Picker
          selectedValue={value}
          onValueChange={(itemValue) => onChange(itemValue as PropertyType)}
          style={{ height: 55 }}
        >
          {Object.entries(PROPERTY_TYPES).map(([key, { label }]) => (
            <Picker.Item key={key} label={label} value={key} />
          ))}
        </Picker>
      </View>
    </View>
  );
}
