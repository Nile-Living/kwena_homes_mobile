import React, { useCallback, useRef, useState, useMemo, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet, // Keep for potential complex styles
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetModalProvider, // Ensure this is wrapping the screen using the modal
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useColorScheme } from "react-native";
import {
  PROPERTY_TYPES,
  PropertyCategory,
  bedBathGarageOptions, // Renamed from pickerOptions for clarity
  featureOptions,
  getAllAmenities,
} from "@/constants/propertyTypes"; // Import constants

// Define the structure of filters passed back to the parent
export interface AppliedFilters {
  selectedType: PropertyCategory | "all";
  selectedBedrooms: string;
  selectedBathrooms: string;
  selectedGarages: string;
  selectedParkings: string; // Represents house parkings OR apt/comm spaces based on context
  selectedFeatures: string;
  selectedAmenities: string[];
  // Add other filters if needed (e.g., land size, commercial type)
  // selectedLandSize?: string;
  // selectedCommercialType?: string;
}

interface FilterModalProps {
  // Optional: Pass initial filter values from parent if needed
  initialFilters?: Partial<AppliedFilters>;
  onApply: (filters: AppliedFilters) => void;
  onClear: () => void;
}

// Get all possible amenities once
const allAmenitiesList = getAllAmenities();
// Get all commercial subtypes if needed for a picker
const commercialSubTypes = [
    'Any', 'Office', 'Retail', 'Warehouse', 'Industrial',
    'Mixed-Use', 'Restaurant', 'Other'
];

export default function FilterModal({ onApply, onClear, initialFilters }: FilterModalProps) {
  const colorScheme = useColorScheme();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // --- State for Filters ---
  const [selectedType, setSelectedType] = useState<PropertyCategory | "all">(initialFilters?.selectedType || "all");
  const [selectedBedrooms, setSelectedBedrooms] = useState<string>(initialFilters?.selectedBedrooms || "Any");
  const [selectedBathrooms, setSelectedBathrooms] = useState<string>(initialFilters?.selectedBathrooms || "Any");
  const [selectedGarages, setSelectedGarages] = useState<string>(initialFilters?.selectedGarages || "Any");
  // Note: 'selectedParkings' state might represent different things.
  // The label changes, but the state holds the value (e.g., "2+").
  // Backend needs to know which field (house_parkings vs parking_spaces) to query based on category.
  const [selectedParkings, setSelectedParkings] = useState<string>(initialFilters?.selectedParkings || "Any");
  const [selectedFeatures, setSelectedFeatures] = useState<string>(initialFilters?.selectedFeatures || "Any");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialFilters?.selectedAmenities || []);
  // Add state for other filters if implemented
  // const [selectedLandSize, setSelectedLandSize] = useState<string>("Any");
  // const [selectedCommercialType, setSelectedCommercialType] = useState<string>("Any");

  // --- Modal Handling ---
  const openModal = useCallback(() => {
    // Optional: Reset state to initialFilters when opening if desired
    // resetStateToInitial();
    bottomSheetModalRef.current?.present();
  }, []);

  const closeModal = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  // --- Derived State & Logic ---
  const currentCategoryDetails = useMemo(() => {
    return selectedType !== 'all' ? PROPERTY_TYPES[selectedType] : null;
  }, [selectedType]);

  // Reset specific filters when type changes to avoid applying irrelevant filters
  const handleTypeChange = (value: PropertyCategory | "all") => {
    setSelectedType(value);
    setSelectedAmenities([]); // Reset amenities as available ones might change

    // Reset filters that are definitely not applicable
    if (!currentCategoryDetails?.hasBedBath && value !== 'all') {
      setSelectedBedrooms("Any");
      setSelectedBathrooms("Any");
    }
    if (!currentCategoryDetails?.hasGaragesParkings && value !== 'all') {
      setSelectedGarages("Any");
      // Decide if selectedParkings should reset based on your logic
      // If it represents BOTH house/apt parkings, maybe don't reset?
      // If it ONLY represents house parkings, reset if not house.
      // setSelectedParkings("Any");
    }
    // Add resets for land/commercial/etc. specific filters if they exist
    // if (!currentCategoryDetails?.hasLandDetails && value !== 'all') { setSelectedLandSize("Any"); }
    // if (!currentCategoryDetails?.hasCommercialDetails && value !== 'all') { setSelectedCommercialType("Any"); }
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  // Reset internal state and call parent's onClear
  const handleClear = () => {
    setSelectedType("all");
    setSelectedBedrooms("Any");
    setSelectedBathrooms("Any");
    setSelectedGarages("Any");
    setSelectedParkings("Any");
    setSelectedFeatures("Any");
    setSelectedAmenities([]);
    // Reset other filter states here
    // setSelectedLandSize("Any");
    // setSelectedCommercialType("Any");
    onClear(); // Call parent clear function (which resets parent state)
    closeModal();
  };

  // Apply filters and close
  const handleApply = () => {
     onApply({
        selectedType,
        selectedBedrooms,
        selectedBathrooms,
        selectedGarages,
        selectedParkings,
        selectedFeatures,
        selectedAmenities,
        // Add other filters here
        // selectedLandSize,
        // selectedCommercialType,
     });
     closeModal();
  }

  // Reset state if initialFilters change (e.g., parent cleared filters)
  // This might be needed if the modal stays mounted and parent state changes
  useEffect(() => {
    setSelectedType(initialFilters?.selectedType || "all");
    setSelectedBedrooms(initialFilters?.selectedBedrooms || "Any");
    setSelectedBathrooms(initialFilters?.selectedBathrooms || "Any");
    setSelectedGarages(initialFilters?.selectedGarages || "Any");
    setSelectedParkings(initialFilters?.selectedParkings || "Any");
    setSelectedFeatures(initialFilters?.selectedFeatures || "Any");
    setSelectedAmenities(initialFilters?.selectedAmenities || []);
    // Reset other filters based on initialFilters
  }, [initialFilters]);


  return (
    <>
      {/* Filter Icon Button (Style as needed) */}
      <TouchableOpacity
        // Example styling - adjust to your app's design
        className="p-2 border border-gray-300 rounded-lg bg-white shadow-sm"
        onPress={openModal}
      >
        <Ionicons name="options-outline" size={24} color="#4B5563" />
      </TouchableOpacity>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0} // Start at the first snap point
        snapPoints={['90%']} // Adjust snap points as needed (e.g., ['50%', '90%'])
        enablePanDownToClose={true}
        // Use backgroundStyle for theming
        backgroundStyle={{ backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#F9FAFB' }} // Example dark/light bg
        handleIndicatorStyle={{ backgroundColor: colorScheme === 'dark' ? '#6B7280' : '#D1D5DB' }} // Indicator color
        containerStyle={{ zIndex: 1000 }} // Ensure modal is on top
      >
        <BottomSheetView className="flex-1">
          {/* Header inside modal */}
           <View className="px-4 pt-4 pb-2 flex-row justify-between items-center border-b border-gray-200 dark:border-gray-700">
             <Text className="text-xl font-semibold text-gray-900 dark:text-white">Filter Properties</Text>
             <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
             </TouchableOpacity>
           </View>

          <BottomSheetScrollView
            className="p-4" // Padding for content
            contentContainerStyle={{ paddingBottom: 90 }} // Ensure space below footer buttons
          >

            {/* Property Type Picker */}
            <View className="mb-5">
              <Text className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">Property Type</Text>
              <View className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                <Picker
                  selectedValue={selectedType}
                  onValueChange={handleTypeChange}
                  style={[styles.picker, { color: colorScheme === 'dark' ? 'white' : 'black' }]}
                  itemStyle={styles.pickerItem} // Style individual items if needed
                  dropdownIconColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                >
                  <Picker.Item label="All Properties" value="all" />
                  {Object.entries(PROPERTY_TYPES).map(([key, value]) => (
                    <Picker.Item key={key} label={value.label} value={key as PropertyCategory} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* --- Conditional Filters --- */}

            {/* Bedrooms/Bathrooms */}
            {(selectedType === 'all' || currentCategoryDetails?.hasBedBath) && (
              <View className="flex-row space-x-4 mb-5">
                <View className="flex-1">
                  <Text className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">Bedrooms</Text>
                  <View className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                    <Picker selectedValue={selectedBedrooms} onValueChange={setSelectedBedrooms} style={[styles.picker, { color: colorScheme === 'dark' ? 'white' : 'black' }]} itemStyle={styles.pickerItem} dropdownIconColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}>
                      {bedBathGarageOptions.map((o) => <Picker.Item key={o} label={o} value={o} />)}
                    </Picker>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">Bathrooms</Text>
                   <View className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                    <Picker selectedValue={selectedBathrooms} onValueChange={setSelectedBathrooms} style={[styles.picker, { color: colorScheme === 'dark' ? 'white' : 'black' }]} itemStyle={styles.pickerItem} dropdownIconColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}>
                       {bedBathGarageOptions.map((o) => <Picker.Item key={o} label={o} value={o} />)}
                    </Picker>
                  </View>
                </View>
              </View>
            )}

            {/* Garages/Parkings */}
             {(selectedType === 'all' || currentCategoryDetails?.hasGaragesParkings || currentCategoryDetails?.hasSquareMeters) && (
                 <View className="flex-row space-x-4 mb-5">
                    {/* Garages (Only if relevant) */}
                    {(selectedType === 'all' || currentCategoryDetails?.hasGaragesParkings) && (
                        <View className="flex-1">
                            <Text className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">Garages</Text>
                            <View className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                            <Picker selectedValue={selectedGarages} onValueChange={setSelectedGarages} style={[styles.picker, { color: colorScheme === 'dark' ? 'white' : 'black' }]} itemStyle={styles.pickerItem} dropdownIconColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}>
                                {bedBathGarageOptions.map((o) => <Picker.Item key={o} label={o} value={o} />)}
                            </Picker>
                            </View>
                        </View>
                    )}
                    {/* Parkings (Label changes, represents house OR apt/comm) */}
                     {(selectedType === 'all' || currentCategoryDetails?.hasGaragesParkings || currentCategoryDetails?.hasSquareMeters) && (
                        <View className="flex-1">
                            <Text className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">
                                {currentCategoryDetails?.hasGaragesParkings ? "Parkings (House)" : "Parking Spaces"}
                            </Text>
                            <View className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                            <Picker selectedValue={selectedParkings} onValueChange={setSelectedParkings} style={[styles.picker, { color: colorScheme === 'dark' ? 'white' : 'black' }]} itemStyle={styles.pickerItem} dropdownIconColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}>
                                {bedBathGarageOptions.map((o) => <Picker.Item key={o} label={o} value={o} />)}
                            </Picker>
                            </View>
                        </View>
                     )}
                 </View>
             )}

            {/* Land Filters */}
            {(selectedType === 'all' || currentCategoryDetails?.hasLandDetails) && (
                <View className="mb-5">
                    <Text className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Land Filters</Text>
                    {/* Add Pickers/Inputs for land size, status etc. */}
                    {/* Example: Legal Status */}
                     <View className="mb-4">
                        <Text className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">Legal Status</Text>
                        <View className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                            {/* Replace with actual legal status options */}
                            <Picker selectedValue={"Any"} /* Add state */ onValueChange={() => {}} style={[styles.picker, { color: colorScheme === 'dark' ? 'white' : 'black' }]} itemStyle={styles.pickerItem} dropdownIconColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}>
                                <Picker.Item label="Any" value="Any" />
                                <Picker.Item label="Title Deed" value="Title Deed" />
                                <Picker.Item label="Customary" value="Customary" />
                            </Picker>
                        </View>
                    </View>
                </View>
            )}

             {/* Commercial Filters */}
            {(selectedType === 'all' || currentCategoryDetails?.hasCommercialDetails) && (
                <View className="mb-5">
                    <Text className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Commercial Filters</Text>
                     <View className="mb-4">
                        <Text className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">Commercial Type</Text>
                        <View className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                            <Picker selectedValue={"Any"} /* Add state */ onValueChange={() => {}} style={[styles.picker, { color: colorScheme === 'dark' ? 'white' : 'black' }]} itemStyle={styles.pickerItem} dropdownIconColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}>
                                {commercialSubTypes.map(type => <Picker.Item key={type} label={type} value={type} />)}
                            </Picker>
                        </View>
                    </View>
                     {/* Add Square Meters filter if needed (might be combined above) */}
                </View>
            )}

            {/* Features Dropdown */}
            <View className="mb-5">
              <Text className="text-base font-medium mb-2 text-gray-700 dark:text-gray-300">Features</Text>
              <View className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                <Picker selectedValue={selectedFeatures} onValueChange={setSelectedFeatures} style={[styles.picker, { color: colorScheme === 'dark' ? 'white' : 'black' }]} itemStyle={styles.pickerItem} dropdownIconColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}>
                  {featureOptions.map((o) => <Picker.Item key={o} label={o} value={o} />)}
                </Picker>
              </View>
            </View>

            {/* Amenities Checkboxes */}
            <View className="mb-6">
              <Text className="text-base font-medium mb-3 text-gray-700 dark:text-gray-300">Amenities</Text>
              <View className="flex-row flex-wrap -m-1">
                {/* Show all amenities, user can select any combination */}
                {allAmenitiesList.map((item) => (
                  <TouchableOpacity
                    key={item}
                    className="flex-row items-center m-1 p-2 border rounded-full" // Adjusted styling
                    style={{ // Dynamic border/bg based on selection
                        borderColor: selectedAmenities.includes(item) ? '#3B82F6' : (colorScheme === 'dark' ? '#4B5563' : '#D1D5DB'),
                        backgroundColor: selectedAmenities.includes(item) ? (colorScheme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : '#DBEAFE') : 'transparent'
                    }}
                    onPress={() => toggleAmenity(item)}
                  >
                    <Ionicons
                      name={selectedAmenities.includes(item) ? "checkmark-circle" : "ellipse-outline"} // Changed icons
                      size={18}
                      color={selectedAmenities.includes(item) ? "#2563EB" : (colorScheme === 'dark' ? '#9CA3AF' : "#6B7280")}
                      style={{ marginRight: 6 }} // Use style for margin with icons
                    />
                    <Text className={`text-sm ${selectedAmenities.includes(item) ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                        {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

          </BottomSheetScrollView>

           {/* Footer Buttons (Fixed at bottom) */}
           {/* Position this view absolutely or ensure ScrollView has enough paddingBottom */}
            <View className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-row justify-between">
              <TouchableOpacity
                className="flex-1 px-5 py-3 bg-gray-200 dark:bg-gray-600 rounded-full mr-2"
                onPress={handleClear}
              >
                <Text className="text-center font-semibold text-gray-700 dark:text-gray-200">Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 px-5 py-3 bg-emerald-700 rounded-full ml-2 shadow-sm" // Use theme color
                onPress={handleApply}
              >
                <Text className="text-center font-semibold text-white">Apply Filters</Text>
              </TouchableOpacity>
            </View>

        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
}

// Basic styles for Picker (adjust as needed)
const styles = StyleSheet.create({
    picker: {
        height: 55, // Standard height
        width: '100%',
    },
    pickerItem: {
        // iOS specific styling if needed
    }
});
