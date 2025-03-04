import React from "react";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useCallback, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FilterModalProps {
  onApply: () => void;
  onClear: () => void;
}

const propertyTypes = [
    "House",
    "Townhouse/Cluster",
    "Apartment/Flat",
    "Vacant land/Plot",
    "Farm/Smallholding",
  ];
  
  export default function FilterModal({ onApply, onClear }: FilterModalProps) {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  
    const openModal = useCallback(() => {
      bottomSheetModalRef.current?.present();
    }, []);
  
    const closeModal = useCallback(() => {
      bottomSheetModalRef.current?.dismiss();
    }, []);
  
    const handleSheetChanges = useCallback((index: number) => {
      console.log("handleSheetChanges", index);
    }, []);
  
    return (
      <BottomSheetModalProvider>
        <TouchableOpacity
          className="bg-light-tint border border-gray-50 p-3 rounded-full ml-2"
          onPress={openModal}
        >
          <Ionicons name="options" size={24} color="white" />
        </TouchableOpacity>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          snapPoints={["90%"]}
          backgroundStyle={{ backgroundColor: "#F5F5F5" }}
          containerStyle={{ 
            zIndex: 1000,
            justifyContent: 'flex-end',
            overflow: "visible"
          }}
          onChange={handleSheetChanges}
        >
          <BottomSheetView>
            <View className="p-4">
              <Text className="text-lg font-bold mb-2">Property Type</Text>
              {propertyTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  className="p-3 border-b border-light-border"
                >
                  <Text>{type}</Text>
                </TouchableOpacity>
              ))}
  
              <View className="flex-row justify-between mt-5">
                <TouchableOpacity
                  className="px-6 py-4 bg-gray-200 rounded-lg"
                  onPress={() => {
                    onClear();
                    closeModal();
                  }}
                >
                  <Text>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="px-6 py-4 bg-light-tint rounded-lg"
                  onPress={() => {
                    onApply();
                    closeModal();
                  }}
                >
                  <Text className="text-white">Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    );
  }