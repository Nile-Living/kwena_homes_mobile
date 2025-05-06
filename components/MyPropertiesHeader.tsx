import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { HeaderBackButton } from '@react-navigation/elements';
import { useNavigation } from 'expo-router';
import Constants from 'expo-constants'; // Import Constants
import HeaderSearchBar from './HeaderSearchBar';
import HeaderAddButton from './HeaderAddButton';

interface MyPropertiesHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onSearchClear: () => void;
  searchPlaceholder?: string;
  onAddPress: () => void;
  addTintColor?: string;
  backButtonTintColor?: string;
}

const MyPropertiesHeader: React.FC<MyPropertiesHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onSearchClear,
  searchPlaceholder,
  onAddPress,
  addTintColor,
  backButtonTintColor,
}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.outerContainer}>
      <View style={styles.innerContainer}>
        {navigation.canGoBack() && (
          <View style={styles.backButtonContainer}>
            <HeaderBackButton
              onPress={() => navigation.goBack()}
              tintColor={backButtonTintColor || (Platform.OS === 'ios' ? '#007AFF' : '#000000')}
              style={styles.backButton}
            />
          </View>
        )}
        <View style={styles.searchContainer}>
          <HeaderSearchBar
            value={searchQuery}
            onChangeText={onSearchChange}
            onClear={onSearchClear}
            placeholder={searchPlaceholder}
          />
        </View>
        <View style={styles.addContainer}>
          <HeaderAddButton onPress={onAddPress} tintColor={addTintColor} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: 'white', // Or your desired header background color
    paddingTop: Constants.statusBarHeight, // Add padding for the status bar
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#A7A7AA',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Platform.OS === 'ios' ? 44 : 56, // This is the height of the interactive part
    paddingHorizontal: 8,
    // backgroundColor: 'white', // Moved to outerContainer
  },
  backButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
  },
  backButton: {
    marginLeft: Platform.OS === 'ios' ? 0 : -5,
  },
  searchContainer: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  addContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
  },
});

export default MyPropertiesHeader;
