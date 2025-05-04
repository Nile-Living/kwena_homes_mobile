import React, {
  useCallback,
  useState,
  useMemo,
  useEffect,
} from "react";
import { 
  Text, 
  TouchableOpacity, 
  View, 
  StyleSheet, 
  Modal,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useColorScheme } from "react-native";
import {
  PROPERTY_TYPES,
  PropertyCategory,
  bedBathGarageOptions,
  featureOptions,
  getAllAmenities,
} from "@/constants/propertyTypes"; // Assuming this path is correct

// --- Interfaces and Constants (Keep as they were) ---
export interface AppliedFilters {
  selectedType: PropertyCategory | "all";
  selectedBedrooms: string;
  selectedBathrooms: string;
  selectedGarages: string;
  selectedParkings: string;
  selectedFeatures: string;
  selectedAmenities: string[];
  // Add other potential filters if they exist
}

interface FilterModalProps {
  initialFilters?: Partial<AppliedFilters>;
  onApply: (filters: AppliedFilters) => void;
  onClear: () => void;
}

const allAmenitiesList = getAllAmenities();
const commercialSubTypes = [
  "Any", "Office", "Retail", "Warehouse", "Industrial",
  "Mixed-Use", "Restaurant", "Other",
];

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- Component ---

export default function FilterModal({
  onApply,
  onClear,
  initialFilters,
}: FilterModalProps) {
  const colorScheme = useColorScheme();
  const [modalVisible, setModalVisible] = useState(false);

  // State for Filters (Keep as they were)
  const [selectedType, setSelectedType] = useState<PropertyCategory | "all">(
    initialFilters?.selectedType || "all"
  );
  const [selectedBedrooms, setSelectedBedrooms] = useState<string>(
    initialFilters?.selectedBedrooms || "Any"
  );
  const [selectedBathrooms, setSelectedBathrooms] = useState<string>(
    initialFilters?.selectedBathrooms || "Any"
  );
  const [selectedGarages, setSelectedGarages] = useState<string>(
    initialFilters?.selectedGarages || "Any"
  );
  const [selectedParkings, setSelectedParkings] = useState<string>(
    initialFilters?.selectedParkings || "Any"
  );
  const [selectedFeatures, setSelectedFeatures] = useState<string>(
    initialFilters?.selectedFeatures || "Any"
  );
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    initialFilters?.selectedAmenities || []
  );
  // Add state for other filters if needed

  // --- Callbacks and Effects ---

  const openModal = useCallback(() => setModalVisible(true), []);
  const closeModal = useCallback(() => setModalVisible(false), []);

  const currentCategoryDetails = useMemo(() => {
    return selectedType !== "all" ? PROPERTY_TYPES[selectedType] : null;
  }, [selectedType]);

  const handleTypeChange = (value: PropertyCategory | "all") => {
    setSelectedType(value);
    setSelectedAmenities([]); // Reset amenities when type changes
    const details = value !== "all" ? PROPERTY_TYPES[value] : null;
    if (!details?.hasBedBath) {
      setSelectedBedrooms("Any");
      setSelectedBathrooms("Any");
    }
    if (!details?.hasGaragesParkings) {
      setSelectedGarages("Any");
      // setSelectedParkings("Any"); // Decide based on logic
    }
    // Reset other specific filters
  };

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
    // Reset other filter states
    onClear();
    closeModal();
  };

  const handleApply = () => {
    onApply({
      selectedType,
      selectedBedrooms,
      selectedBathrooms,
      selectedGarages,
      selectedParkings,
      selectedFeatures,
      selectedAmenities,
      // Include other filters if added
    });
    closeModal();
  };

  // Effect to update state if initialFilters change
  useEffect(() => {
    if (initialFilters) {
      setSelectedType(initialFilters?.selectedType || "all");
      setSelectedBedrooms(initialFilters?.selectedBedrooms || "Any");
      setSelectedBathrooms(initialFilters?.selectedBathrooms || "Any");
      setSelectedGarages(initialFilters?.selectedGarages || "Any");
      setSelectedParkings(initialFilters?.selectedParkings || "Any");
      setSelectedFeatures(initialFilters?.selectedFeatures || "Any");
      setSelectedAmenities(initialFilters?.selectedAmenities || []);
    }
    // Update other filters if needed
  }, [initialFilters]);

  // --- Render ---
  return (
    <>
      {/* Filter Icon Button */}
      <TouchableOpacity
        className="p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 shadow-sm"
        onPress={openModal}
      >
        <Ionicons
          name="options-outline"
          size={24}
          color={colorScheme === "dark" ? "#E5E7EB" : "#4B5563"}
        />
      </TouchableOpacity>

      {/* Modal Component */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colorScheme === "dark" ? "#1F2937" : "#FFFFFF",
                maxHeight: SCREEN_HEIGHT * 0.9,
              },
            ]}
          >
            {/* Header */}
            <View className="px-4 pt-5 pb-3 flex-row justify-between items-center border-b border-gray-200 dark:border-gray-700">
              <Text className="text-xl font-semibold text-gray-900 dark:text-white">
                Filter Properties
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons
                  name="close-circle"
                  size={28}
                  color={colorScheme === "dark" ? "#9CA3AF" : "#6B7280"}
                />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 100, // Space for buttons
                paddingHorizontal: 16,
              }}
            >
              <View className="pt-4">
                {/* Property Type Picker */}
                <View className="mb-5">
                  <Text className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Property Type
                  </Text>
                  <View className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700">
                    <Picker
                      selectedValue={selectedType}
                      onValueChange={handleTypeChange}
                      style={[
                        styles.picker,
                        { color: colorScheme === "dark" ? "white" : "black" },
                      ]}
                      itemStyle={styles.pickerItem}
                      dropdownIconColor={
                        colorScheme === "dark" ? "#9CA3AF" : "#6B7280"
                      }
                    >
                      <Picker.Item label="All Properties" value="all" />
                      {Object.entries(PROPERTY_TYPES).map(([key, value]) => (
                        <Picker.Item
                          key={key}
                          label={value.label}
                          value={key as PropertyCategory}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                {/* --- Conditional Filters --- */}

                {/* Bedrooms/Bathrooms */}
                {(selectedType === "all" || currentCategoryDetails?.hasBedBath) && (
                  <View className="flex-row gap-2 space-x-4 mb-5">
                    {/* Bedrooms Picker */}
                    <View className="flex-1">
                      <Text className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">Bedrooms</Text>
                      <View className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700">
                        <Picker
                          selectedValue={selectedBedrooms}
                          onValueChange={setSelectedBedrooms}
                          style={[styles.picker, { color: colorScheme === 'dark' ? 'white' : 'black' }]}
                          itemStyle={styles.pickerItem}
                          dropdownIconColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                        >
                          {bedBathGarageOptions.map((o) => (
                            <Picker.Item key={o} label={o} value={o} />
                          ))}
                        </Picker>
                      </View>
                    </View>
                    {/* Bathrooms Picker */}
                    <View className="flex-1">
                      <Text className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">Bathrooms</Text>
                      <View className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700">
                        <Picker
                          selectedValue={selectedBathrooms}
                          onValueChange={setSelectedBathrooms}
                          style={[styles.picker, { color: colorScheme === 'dark' ? 'white' : 'black' }]}
                          itemStyle={styles.pickerItem}
                          dropdownIconColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                        >
                          {bedBathGarageOptions.map((o) => (
                            <Picker.Item key={o} label={o} value={o} />
                          ))}
                        </Picker>
                      </View>
                    </View>
                  </View>
                )}

                {/* Garages/Parkings */}
                {(selectedType === "all" ||
                  currentCategoryDetails?.hasGaragesParkings ||
                  currentCategoryDetails?.hasSquareMeters
                ) && (
                  <View className="flex-row gap-2 space-x-4 mb-5">
                    {/* Garages */}
                    {(selectedType === "all" ||
                      currentCategoryDetails?.hasGaragesParkings) && (
                      <View className="flex-1">
                        <Text className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">Garages</Text>
                        <View className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700">
                          <Picker
                            selectedValue={selectedGarages}
                            onValueChange={setSelectedGarages}
                            style={[styles.picker, { color: colorScheme === 'dark' ? 'white' : 'black' }]}
                            itemStyle={styles.pickerItem}
                            dropdownIconColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                          >
                            {bedBathGarageOptions.map((o) => (
                              <Picker.Item key={o} label={o} value={o} />
                            ))}
                          </Picker>
                        </View>
                      </View>
                    )}

                    {/* Parkings */}
                    {(selectedType === "all" ||
                      currentCategoryDetails?.hasGaragesParkings ||
                      currentCategoryDetails?.hasSquareMeters
                    ) && (
                      <View className="flex-1">
                        <Text className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">
                          {currentCategoryDetails?.hasGaragesParkings
                            ? "Parkings (House)"
                            : "Parking Spaces"
                          }
                        </Text>
                        <View className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700">
                          <Picker
                            selectedValue={selectedParkings}
                            onValueChange={setSelectedParkings}
                            style={[styles.picker, { color: colorScheme === 'dark' ? 'white' : 'black' }]}
                            itemStyle={styles.pickerItem}
                            dropdownIconColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                          >
                            {bedBathGarageOptions.map((o) => (
                              <Picker.Item key={o} label={o} value={o} />
                            ))}
                          </Picker>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* Land Filters */}
                {(selectedType === "all" ||
                  currentCategoryDetails?.hasLandDetails) && (
                  <View className="mb-5">
                    <Text className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                      Land Filters
                    </Text>
                    {/* Example: Legal Status */}
                    <View className="mb-4">
                      <Text className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Legal Status
                      </Text>
                      <View className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700">
                        <Picker
                          selectedValue={"Any"} // Replace with state
                          onValueChange={() => {}} // Replace with setter
                          style={[ styles.picker, { color: colorScheme === "dark" ? "white" : "black" }]}
                          itemStyle={styles.pickerItem}
                          dropdownIconColor={ colorScheme === "dark" ? "#9CA3AF" : "#6B7280" }
                        >
                          <Picker.Item label="Any" value="Any" />
                          <Picker.Item label="Title Deed" value="Title Deed" />
                          <Picker.Item label="Customary" value="Customary" />
                        </Picker>
                      </View>
                    </View>
                  </View>
                )}

                {/* Commercial Filters */}
                {(selectedType === "all" ||
                  currentCategoryDetails?.hasCommercialDetails) && (
                  <View className="mb-5">
                    <Text className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                      Commercial Filters
                    </Text>
                    <View className="mb-4">
                      <Text className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Commercial Type
                      </Text>
                      <View className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700">
                        <Picker
                          selectedValue={"Any"} // Replace with state
                          onValueChange={() => {}} // Replace with setter
                          style={[ styles.picker, { color: colorScheme === "dark" ? "white" : "black" }]}
                          itemStyle={styles.pickerItem}
                          dropdownIconColor={ colorScheme === "dark" ? "#9CA3AF" : "#6B7280" }
                        >
                          {commercialSubTypes.map((type) => (
                            <Picker.Item key={type} label={type} value={type} />
                          ))}
                        </Picker>
                      </View>
                    </View>
                  </View>
                )}

                {/* Features Dropdown */}
                <View className="mb-5">
                  <Text className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Features
                  </Text>
                  <View className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700">
                    <Picker
                      selectedValue={selectedFeatures}
                      onValueChange={setSelectedFeatures}
                      style={[ styles.picker, { color: colorScheme === "dark" ? "white" : "black" }]}
                      itemStyle={styles.pickerItem}
                      dropdownIconColor={ colorScheme === "dark" ? "#9CA3AF" : "#6B7280" }
                    >
                      {featureOptions.map((o) => (
                        <Picker.Item key={o} label={o} value={o} />
                      ))}
                    </Picker>
                  </View>
                </View>

                {/* Amenities Checkboxes */}
                <View className="mb-6">
                  <Text className="text-base font-medium mb-3 text-gray-700 dark:text-gray-300">
                    Amenities
                  </Text>
                  <View className="flex-row flex-wrap -m-1">
                    {allAmenitiesList.map((item) => (
                      <TouchableOpacity
                        key={item}
                        className="flex-row items-center m-1 p-2 border rounded-full"
                        style={{
                          borderColor: selectedAmenities.includes(item) ? "#3B82F6" : colorScheme === "dark" ? "#4B5563" : "#D1D5DB",
                          backgroundColor: selectedAmenities.includes(item) ? (colorScheme === "dark" ? "rgba(59, 130, 246, 0.3)" : "#DBEAFE") : "transparent",
                        }}
                        onPress={() => toggleAmenity(item)}
                      >
                        <Ionicons
                          name={ selectedAmenities.includes(item) ? "checkmark-circle" : "ellipse-outline" }
                          size={18}
                          color={ selectedAmenities.includes(item) ? "#2563EB" : colorScheme === "dark" ? "#9CA3AF" : "#6B7280" }
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          className={`text-sm ${ selectedAmenities.includes(item) ? "text-blue-700 dark:text-blue-300 font-medium" : "text-gray-700 dark:text-gray-300" }`}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-row items-center">
              <TouchableOpacity
                className="flex-1 px-5 py-3 bg-gray-200 dark:bg-gray-600 rounded-full mr-2"
                onPress={handleClear}
              >
                <Text className="text-center font-semibold text-gray-700 dark:text-gray-200">
                  Clear All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 px-5 py-3 bg-emerald-600 dark:bg-emerald-700 rounded-full ml-2 shadow-md"
                onPress={handleApply}
              >
                <Text className="text-center font-semibold text-white">
                  Apply Filters
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

// Styles
const styles = StyleSheet.create({
  picker: {
    height: 50,
    width: "100%",
  },
  pickerItem: {
    // Style individual picker items if needed
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  modalContent: {
    flex: 1,
    margin: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});