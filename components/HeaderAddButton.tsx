import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderAddButtonProps {
  onPress: () => void;
  tintColor?: string; // Expo Router passes tintColor
}

const HeaderAddButton: React.FC<HeaderAddButtonProps> = ({
  onPress,
  tintColor,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <Ionicons
        name="add-circle-outline" // Changed icon slightly
        size={28} // Slightly larger for header
        color={tintColor || '#4F46E5'} // Use tintColor or default
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    marginRight: 15, // Adjust spacing as needed
    padding: 5,
  },
});

export default HeaderAddButton;
