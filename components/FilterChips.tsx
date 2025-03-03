import { ScrollView, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

interface FilterOption {
  id: string;
  label: string;
}

interface FilterChipsProps {
  options: FilterOption[];
  selectedFilters: string[];
  onSelectFilter: (filterId: string) => void;
  singleSelect?: boolean;
}

export default function FilterChips({
  options,
  selectedFilters,
  onSelectFilter,
  singleSelect = false,
}: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {options.map((option) => {
        const isSelected = selectedFilters.includes(option.id);
        return (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.chip,
              isSelected ? styles.selectedChip : styles.unselectedChip,
            ]}
            onPress={() => onSelectFilter(option.id)}
          >
            <Text
              style={[
                styles.chipText,
                isSelected ? styles.selectedChipText : styles.unselectedChipText,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    marginRight: 8,
    // height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedChip: {
    backgroundColor: "#244835",
    borderColor: "#244835",
  },
  unselectedChip: {
    backgroundColor: "transparent",
    borderColor: "#E0E0E0",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  selectedChipText: {
    color: "#FFFFFF",
  },
  unselectedChipText: {
    color: "#666666",
  },
});