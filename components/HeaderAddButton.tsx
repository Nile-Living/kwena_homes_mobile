import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderAddButtonProps {
  onPress: () => void;
  tintColor?: string;
}

const HeaderAddButton: React.FC<HeaderAddButtonProps> = ({ onPress, tintColor }) => {
  const handlePress = () => {
    console.log('Button pressed in component');
    onPress();
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      style={styles.button}
      activeOpacity={0.6}
      testID="header-add-button"
    >
      <Ionicons
        name="add-circle-outline"
        size={28}
        color={tintColor || '#4F46E5'}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    marginRight: 16,
    padding: 8,
    backgroundColor: 'transparent',
  },
});

export default React.memo(HeaderAddButton);
