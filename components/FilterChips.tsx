import { ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

interface FilterOption {
  id: string;
  label: string;
}

interface FilterChipsProps {
  options: FilterOption[];
  selectedFilters: string[];
  onSelectFilter: (filterId: string) => void;
}

export default function FilterChips({
  options,
  selectedFilters,
  onSelectFilter,
}: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="h-16 pb-2"
    >
      {options.map((option) => {
        const isSelected = selectedFilters.includes(option.id);
        return (
          <TouchableOpacity
            key={option.id}
            style={[styles.chip, isSelected && styles.selectedChip]}
            onPress={() => onSelectFilter(option.id)}
          >
            <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>
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
  },
  selectedChip: {
    backgroundColor: "#244835",
  },
  chipText: {
    fontSize: 14,
    color: "#666",
  },
  selectedChipText: {
    color: "#FFF",
  },
});
