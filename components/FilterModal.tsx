import React from "react";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useCallback, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useColorScheme } from "react-native";
import { PROPERTY_TYPES, PropertyCategory } from "@/constants/PropertyTypes";

interface FilterModalProps {
  onApply: (filters: {
    selectedType: PropertyCategory | "all";
    selectedBedrooms: string;
    selectedBathrooms: string;
    selectedGarages: string;
    selectedParkings: string;
    selectedFeatures: string;
    selectedAmenities: string[];
  }) => void;
  onClear: () => void;
}

const propertyTypes = [
  "All properties",
  "House",
  "Flat",
  "Vacant Land",
  "Gated Estate",
  "Lodge",
  "Freestanding",
  "Commercial",
  "Industrial",
];

const pickerOptions = ["Any", "1 +", "2 +", "3 +", "4 +", "5 +"];

const amenitiesList = [
  "Pets allowed",
  "Pool",
  "Staff quarters",
  "Garden",
  "Security system",
  "Borehole",
  "Solar System/Generator",
  "Parking",
];

const features = [
  "Self-contained",
  "Furnished",
  "Unfurnished",
  "Modern Fittings",
];

export default function FilterModal({ onApply, onClear }: FilterModalProps) {
  const colorScheme = useColorScheme();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [selectedType, setSelectedType] = useState<PropertyCategory | "all">(
    "all"
  );
  const [selectedBedrooms, setSelectedBedrooms] = useState<string>("Any");
  const [selectedBathrooms, setSelectedBathrooms] = useState<string>("Any");
  const [selectedGarages, setSelectedGarages] = useState<string>("Any");
  const [selectedParkings, setSelectedParkings] = useState<string>("Any");
  const [selectedFeatures, setSelectedFeatures] = useState<string>("Any");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const openModal = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const closeModal = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const availableAmenities =
    selectedType === "all" ? [] : PROPERTY_TYPES[selectedType]?.amenities || [];

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleClear = () => {
    setSelectedType("all");
    setSelectedBedrooms("Any");
    setSelectedBathrooms("Any");
    setSelectedGarages("Any");
    setSelectedParkings("Any");
    setSelectedFeatures("Any");
    setSelectedAmenities([]);
    onClear();
    closeModal();
  };

  return (
    <>
      <TouchableOpacity
        className="bg-light-tint border border-dark-ting dark:border-light-tint p-3 rounded-full ml-2"
        onPress={openModal}
      >
        <Ionicons name="options" size={24} color="gray" />
      </TouchableOpacity>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={["95%"]}
        backgroundStyle={{ backgroundColor: "#F5F5F5" }}
        containerStyle={{ zIndex: 1000 }}
      >
        <BottomSheetView className="flex-1">
          <BottomSheetScrollView
            className="p-4"
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
          >
            <Text className="text-xl font-bold mb-4">Filter your results</Text>

            {/* Dropdown for Property Type */}
            <View className="mb-4">
              <Text className="text-base font-semibold mb-2">
                Property Type
              </Text>
              <View className="border border-gray-200 rounded">
                <Picker
                  selectedValue={selectedType}
                  onValueChange={(value) => {
                    setSelectedType(value);
                    setSelectedAmenities([]);
                  }}
                  style={{ height: 55, color: "#000" }} // sets the overall text color
                  itemStyle={{ color: "#000" }}
                >
                  <Picker.Item label="All properties" value="all" />
                  {Object.entries(PROPERTY_TYPES).map(([key, value]) => (
                    <Picker.Item key={key} label={value.label} value={key} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Two-column layout for numeric dropdowns */}
            {selectedType !== "all" &&
              PROPERTY_TYPES[selectedType].hasBedBath && (
                <View className="flex-row space-x-4 mb-4">
                  {/* Bedrooms Picker */}
                  <View className="flex-1">
                    <Text className="text-base font-semibold mb-2">
                      Bedrooms
                    </Text>
                    <View className="border border-gray-200 rounded">
                      <Picker
                        selectedValue={selectedBedrooms}
                        onValueChange={setSelectedBedrooms}
                        style={{ height: 55 }}
                      >
                        {pickerOptions.map((option) => (
                          <Picker.Item
                            key={option}
                            label={option}
                            value={option}
                          />
                        ))}
                      </Picker>
                    </View>
                  </View>

                  {/* Bathrooms Picker */}
                  <View className="flex-1">
                    <Text className="text-base font-semibold mb-2">
                      Bathrooms
                    </Text>
                    <View className="border border-gray-200 rounded">
                      <Picker
                        selectedValue={selectedBathrooms}
                        onValueChange={setSelectedBathrooms}
                        style={{ height: 55 }}
                      >
                        {pickerOptions.map((option) => (
                          <Picker.Item
                            key={option}
                            label={option}
                            value={option}
                          />
                        ))}
                      </Picker>
                    </View>
                  </View>
                </View>
              )}

            <View className="flex-row space-x-4 mb-4">
              <View className="flex-1">
                <Text className="text-base font-semibold mb-2">Garages</Text>
                <View className="border border-gray-200 rounded">
                  <Picker
                    selectedValue={selectedGarages}
                    onValueChange={(value) => setSelectedGarages(value)}
                    style={{ height: 55 }}
                  >
                    {pickerOptions.map((option) => (
                      <Picker.Item key={option} label={option} value={option} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold mb-2">Parkings</Text>
                <View className="border border-gray-200 rounded">
                  <Picker
                    selectedValue={selectedParkings}
                    onValueChange={(value) => setSelectedParkings(value)}
                    style={{ height: 55 }}
                  >
                    {pickerOptions.map((option) => (
                      <Picker.Item key={option} label={option} value={option} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            {/* Dropdown for Features Features */}
            <View className="mb-4">
              <Text className="text-base font-semibold mb-2">Features</Text>
              <View className="border border-gray-200 rounded">
                <Picker
                  selectedValue={selectedFeatures}
                  onValueChange={(value) => setSelectedFeatures(value)}
                  style={{ height: 55 }}
                >
                  {["Any", ...features].map((option) => (
                    <Picker.Item key={option} label={option} value={option} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Amenities checkboxes remain unchanged */}
            <View className="mb-4">
              <Text className="text-base font-semibold mb-2">Amenities</Text>
              <View className="flex-row flex-wrap">
                {amenitiesList.map((item) => (
                  <TouchableOpacity
                    key={item}
                    className="flex-row items-center mr-4 mb-3"
                    onPress={() => toggleAmenity(item)}
                  >
                    <Ionicons
                      name={
                        selectedAmenities.includes(item)
                          ? "checkbox"
                          : "square-outline"
                      }
                      size={20}
                      color={
                        selectedAmenities.includes(item) ? "#3B82F6" : "#666"
                      }
                      className="mr-1"
                    />
                    <Text>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Footer buttons */}
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="flex-1 px-6 py-3 bg-gray-200 rounded-full mr-2"
                onPress={handleClear}
              >
                <Text className="text-center">Clear all</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 px-6 py-3 bg-gray-200 rounded-full ml-2"
                onPress={() => {
                  onApply({
                    selectedAmenities,
                    selectedBathrooms,
                    selectedBedrooms,
                    selectedFeatures,
                    selectedGarages,
                    selectedParkings,
                    selectedType,
                  });
                  closeModal();
                }}
              >
                <Text className="text-center">Update</Text>
              </TouchableOpacity>
            </View>
          </BottomSheetScrollView>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
}
