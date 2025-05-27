import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LUSAKA_LOCATIONS } from '@/constants/Locations';

interface LocationPickerProps {
  selectedLocation: string;
  onLocationSelect: (location: string) => void;
  placeholder?: string;
}

const ALL_COMPOUNDS_SORTED = (
  LUSAKA_LOCATIONS?.reduce<string[]>((acc, area) => {
    if (area.compounds && Array.isArray(area.compounds)) {
      return [...acc, ...area.compounds];
    }
    return acc;
  }, []) || []
).sort();

export default function LocationPicker({
  selectedLocation,
  onLocationSelect,
  placeholder = "Select location",
}: LocationPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) {
      return ALL_COMPOUNDS_SORTED;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return ALL_COMPOUNDS_SORTED.filter((location) =>
      location.toLowerCase().includes(lowercasedQuery)
    );
  }, [searchQuery]);

  const handleSelectLocation = (location: string) => {
    onLocationSelect(location);
    setModalVisible(false);
    setSearchQuery('');
  };

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      className={`
        p-3 border-b border-gray-200 dark:border-slate-600
        ${selectedLocation === item ? 'bg-customgreen/20 dark:bg-dark-tint/30' : ''}
      `}
      onPress={() => handleSelectLocation(item)}
    >
      <Text className="text-base text-black dark:text-slate-100">
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        className="
          flex-row items-center justify-between p-3 h-[50px]
          border rounded-lg
          border-gray-300 dark:border-slate-500
          bg-light-tint dark:bg-slate-700
        "
        onPress={() => setModalVisible(true)}
      >
        <Text
          className={`
            text-base flex-1
            ${selectedLocation ? 'text-black dark:text-slate-100' : 'text-gray-500 dark:text-slate-400'}
          `}
          numberOfLines={1}
        >
          {selectedLocation || placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          className="text-gray-500 dark:text-slate-400 ml-2"
        />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setSearchQuery('');
        }}
      >
        <TouchableWithoutFeedback onPress={() => {
          setModalVisible(false);
          setSearchQuery('');
        }}>
          <View className="flex-1 justify-end bg-black/30 dark:bg-black/50">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <SafeAreaView className="bg-white dark:bg-slate-800 max-h-[70%] rounded-t-2xl">
                <View className="p-4 border-b border-gray-200 dark:border-slate-600">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-lg font-semibold text-black dark:text-slate-100">
                      Select Location
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setModalVisible(false);
                        setSearchQuery('');
                      }}
                      className="p-1"
                    >
                      <Ionicons name="close" size={28} className="text-black dark:text-slate-100" />
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    className="
                      h-12 px-3 py-2 mb-2 text-base
                      border rounded-lg
                      border-gray-300 dark:border-slate-500
                      bg-light-tint dark:bg-slate-700
                      text-black dark:text-slate-100
                    "
                    placeholder="Search locations..."
                    placeholderTextColor="text-gray-500 dark:text-slate-400"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus={false}
                  />
                </View>

                <FlatList
                  data={filteredLocations}
                  renderItem={renderItem}
                  keyExtractor={(item) => item}
                  className="px-2"
                  keyboardShouldPersistTaps="handled"
                />
                {filteredLocations.length === 0 && (
                   <View className="items-center justify-center p-10">
                     <Text className="text-gray-500 dark:text-slate-400">
                       No locations found.
                     </Text>
                   </View>
                )}
              </SafeAreaView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}
