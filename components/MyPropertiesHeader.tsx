import React from 'react';
import { View, StyleSheet, Platform, useColorScheme } from 'react-native';
import { HeaderBackButton } from '@react-navigation/elements';
import { useNavigation } from 'expo-router';
import Constants from 'expo-constants';
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

const slateColors = {
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
};

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
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const defaultBackButtonTint = Platform.OS === 'ios' ? '#007AFF' : (isDarkMode ? slateColors[200] : '#000000');
  const finalBackButtonTintColor = backButtonTintColor || defaultBackButtonTint;
  const finalAddTintColor = addTintColor || (isDarkMode ? slateColors[200] : '#007AFF');


  return (
    <View style={[styles.outerContainer, isDarkMode && styles.outerContainerDark]}>
      <View style={styles.innerContainer}>
        {navigation.canGoBack() && (
          <View style={styles.backButtonContainer}>
            <HeaderBackButton
              onPress={() => navigation.goBack()}
              tintColor={finalBackButtonTintColor}
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
          <HeaderAddButton onPress={onAddPress} tintColor={finalAddTintColor} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: 'white',
    paddingTop: Constants.statusBarHeight,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#A7A7AA',
  },
  outerContainerDark: {
    backgroundColor: slateColors[800],
    borderBottomColor: slateColors[700],
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Platform.OS === 'ios' ? 44 : 56,
    paddingHorizontal: 8,
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
