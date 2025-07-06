import React from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

interface NearbyPlace {
  name: string;
  distance: string;
  icon: string;
}

interface NearbyPlacesInputProps {
  nearbyPlaces: NearbyPlace[];
  onUpdate: (places: NearbyPlace[]) => void;
  colorScheme: 'light' | 'dark' | null;
}

const ICON_OPTIONS = [
  { label: 'Shopping Mall', value: 'shopping-cart' },
  { label: 'School', value: 'graduation-cap' },
  { label: 'Hospital', value: 'plus-square' },
  { label: 'Restaurant', value: 'cutlery' },
  { label: 'Gas Station', value: 'tint' },
  { label: 'Bank', value: 'university' },
  { label: 'Pharmacy', value: 'medkit' },
  { label: 'Church', value: 'church' },
  { label: 'Road/Highway', value: 'road' },
  { label: 'Public Transport', value: 'bus' },
  { label: 'Market', value: 'shopping-basket' },
  { label: 'Park', value: 'tree' },
  { label: 'Police Station', value: 'shield' },
  { label: 'Government Office', value: 'building' },
  { label: 'Other', value: 'map-pin' },
];

const NearbyPlacesInput: React.FC<NearbyPlacesInputProps> = ({
  nearbyPlaces,
  onUpdate,
  colorScheme,
}) => {
  const inputClasses = `border border-gray-300 dark:border-slate-600 rounded-lg p-3 bg-gray-50 dark:bg-slate-700 text-base text-slate-900 dark:text-slate-100`;
  const labelClasses = `text-sm text-gray-600 dark:text-slate-300 mb-1`;

  const addNearbyPlace = () => {
    if (nearbyPlaces.length >= 10) {
      Alert.alert('Limit Reached', 'Maximum 10 nearby places allowed');
      return;
    }
    
    const newPlace: NearbyPlace = {
      name: '',
      distance: '',
      icon: 'map-pin',
    };
    onUpdate([...nearbyPlaces, newPlace]);
  };

  const removeNearbyPlace = (index: number) => {
    if (nearbyPlaces.length <= 3) {
      Alert.alert('Minimum Required', 'At least 3 nearby places are required');
      return;
    }
    
    const updated = nearbyPlaces.filter((_, i) => i !== index);
    onUpdate(updated);
  };

  const updateNearbyPlace = (index: number, field: keyof NearbyPlace, value: string) => {
    const updated = nearbyPlaces.map((place, i) => 
      i === index ? { ...place, [field]: value } : place
    );
    onUpdate(updated);
  };

  return (
    <View className="mb-6">
      <Text className="text-base font-medium mb-2 text-slate-700 dark:text-slate-300">
        Nearby Places * (Minimum 3 required)
      </Text>
      <Text className="text-sm text-gray-500 dark:text-slate-400 mb-3">
        Add places of interest near your property to help potential buyers/renters
      </Text>

      {nearbyPlaces.map((place, index) => (
        <View key={index} className="mb-4 p-3 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-700">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Place {index + 1}
            </Text>
            {nearbyPlaces.length > 3 && (
              <TouchableOpacity
                onPress={() => removeNearbyPlace(index)}
                className="p-1"
              >
                <Ionicons 
                  name="close-circle" 
                  size={20} 
                  color={colorScheme === 'dark' ? '#ef4444' : '#dc2626'} 
                />
              </TouchableOpacity>
            )}
          </View>

          <View className="mb-3">
            <Text className={labelClasses}>Place Name *</Text>
            <TextInput
              value={place.name}
              onChangeText={(value) => updateNearbyPlace(index, 'name', value)}
              placeholder="e.g. Levy Junction Mall"
              className={inputClasses}
              placeholderTextColor={colorScheme === 'dark' ? '#94a3b8' : '#6b7280'}
            />
          </View>

          <View className="mb-3">
            <Text className={labelClasses}>Distance *</Text>
            <TextInput
              value={place.distance}
              onChangeText={(value) => updateNearbyPlace(index, 'distance', value)}
              placeholder="e.g. 2.5 km, 10 minutes walk"
              className={inputClasses}
              placeholderTextColor={colorScheme === 'dark' ? '#94a3b8' : '#6b7280'}
            />
          </View>

          <View className="mb-2">
            <Text className={labelClasses}>Category *</Text>
            <View className="border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700">
              <Picker
                selectedValue={place.icon}
                onValueChange={(value) => updateNearbyPlace(index, 'icon', value)}
                style={{
                  height: 50,
                  width: '100%',
                  color: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
                }}
                dropdownIconColor={colorScheme === 'dark' ? '#94a3b8' : '#6b7280'}
              >
                {ICON_OPTIONS.map((option) => (
                  <Picker.Item key={option.value} label={option.label} value={option.value} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      ))}

      <TouchableOpacity
        onPress={addNearbyPlace}
        className="flex-row items-center justify-center p-3 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700"
      >
        <Ionicons 
          name="add" 
          size={20} 
          color={colorScheme === 'dark' ? '#94a3b8' : '#6b7280'} 
        />
        <Text className="ml-2 text-gray-600 dark:text-slate-400">
          Add Nearby Place
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default NearbyPlacesInput;