import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import SearchBar from './SearchBar';
import FilterModal from './FilterModal';
import SaveSearchModal from './SaveSearchModal';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { SavedSearchGuard } from './subscription/PremiumFeatureGuard';

interface EnhancedSearchHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onApplyFilters: (filters: any) => void;
  onClearFilters: () => void;
  currentFilters?: any;
}

export const EnhancedSearchHeader: React.FC<EnhancedSearchHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onApplyFilters,
  onClearFilters,
  currentFilters,
}) => {
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'tint');
  const { user } = useAuthStore();
  const { savedSearchCount, maxSavedSearches, checkCanSaveMoreSearches } = useSubscriptionStore();
  
  const [saveSearchModalVisible, setSaveSearchModalVisible] = useState(false);

  const handleSaveSearch = async () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to save searches', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign In',
          onPress: () => router.push('/auth/signin'),
        },
      ]);
      return;
    }

    // Check if user can save more searches
    const limitCheck = await checkCanSaveMoreSearches();
    if (!limitCheck.canSave) {
      Alert.alert(
        'Search Limit Reached',
        `You've reached your limit of ${limitCheck.maxAllowed} saved searches. Upgrade to save more.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Upgrade',
            onPress: () => router.push('/subscriptions/index'),
          },
        ]
      );
      return;
    }

    setSaveSearchModalVisible(true);
  };

  const buildSearchCriteria = () => {
    return {
      searchQuery,
      location: searchQuery,
      ...currentFilters,
    };
  };

  return (
    <View style={styles.container}>
      {/* Main Search Row */}
      <View style={styles.searchRow}>
        <SearchBar
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search properties..."
        />
        <FilterModal
          onApply={onApplyFilters}
          onClear={onClearFilters}
          initialFilters={currentFilters}
        />
      </View>

      {/* Action Buttons Row */}
      <View style={styles.actionRow}>
        {/* Saved Searches Button */}
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: primaryColor }]}
          onPress={() => router.push('/saved-searches/index')}
        >
          <Ionicons name="bookmark-outline" size={16} color={primaryColor} />
          <ThemedText style={[styles.actionButtonText, { color: primaryColor }]}>
            Saved ({savedSearchCount}/{maxSavedSearches === -1 ? '∞' : maxSavedSearches})
          </ThemedText>
        </TouchableOpacity>

        {/* Save Search Button */}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: primaryColor }]}
          onPress={handleSaveSearch}
        >
          <Ionicons name="add" size={16} color="white" />
          <ThemedText style={[styles.actionButtonText, { color: 'white' }]}>
            Save Search
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Save Search Modal */}
      <SaveSearchModal
        visible={saveSearchModalVisible}
        onClose={() => setSaveSearchModalVisible(false)}
        initialCriteria={{
          criteria: buildSearchCriteria(),
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
});