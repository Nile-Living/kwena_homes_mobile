import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import LoadingSpinner from '@/components/LoadingSpinner';
import { SavedSearchGuard } from '@/components/subscription/PremiumFeatureGuard';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useAuthStore } from '@/store/authStore';
import { API_BASE_URL } from '@/constants/Config';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { router } from 'expo-router';

interface SavedSearch {
  id: string;
  search_name: string;
  search_criteria: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const SavedSearches: React.FC = () => {
  const { session } = useAuthStore();
  const { savedSearchCount, maxSavedSearches, checkCanSaveMoreSearches } = useSubscriptionStore();
  const primaryColor = useThemeColor({}, 'tint');
  
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedSearches = async () => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/saved-searches`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch saved searches');
      }

      const searches = await response.json();
      setSavedSearches(searches);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSavedSearches();
    checkCanSaveMoreSearches();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSavedSearches();
  };

  const handleDeleteSearch = async (searchId: string) => {
    if (!session?.access_token) return;

    Alert.alert(
      'Delete Saved Search',
      'Are you sure you want to delete this saved search?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/saved-searches/${searchId}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${session.access_token}`,
                },
              });

              if (!response.ok) {
                throw new Error('Failed to delete saved search');
              }

              setSavedSearches(prev => prev.filter(search => search.id !== searchId));
              checkCanSaveMoreSearches();
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  const handleToggleActive = async (searchId: string, currentActive: boolean) => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/saved-searches/${searchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          is_active: !currentActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update saved search');
      }

      const updatedSearch = await response.json();
      setSavedSearches(prev => 
        prev.map(search => 
          search.id === searchId ? updatedSearch : search
        )
      );
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleRunSearch = (searchCriteria: any) => {
    router.push({
      pathname: '/(tabs)/explore',
      params: {
        searchCriteria: JSON.stringify(searchCriteria),
      },
    });
  };

  const formatSearchCriteria = (criteria: any) => {
    const parts = [];
    
    if (criteria.location) {
      parts.push(`📍 ${criteria.location}`);
    }
    
    if (criteria.propertyType) {
      parts.push(`🏠 ${criteria.propertyType}`);
    }
    
    if (criteria.minPrice || criteria.maxPrice) {
      const minPrice = criteria.minPrice ? `K${criteria.minPrice}` : 'Any';
      const maxPrice = criteria.maxPrice ? `K${criteria.maxPrice}` : 'Any';
      parts.push(`💰 ${minPrice} - ${maxPrice}`);
    }
    
    if (criteria.bedrooms) {
      parts.push(`🛏️ ${criteria.bedrooms} bed${criteria.bedrooms > 1 ? 's' : ''}`);
    }
    
    if (criteria.bathrooms) {
      parts.push(`🚿 ${criteria.bathrooms} bath${criteria.bathrooms > 1 ? 's' : ''}`);
    }
    
    return parts.join(' • ');
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <ThemedText style={styles.loadingText}>Loading saved searches...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <ThemedText style={styles.title}>Saved Searches</ThemedText>
          <View style={styles.countBadge}>
            <ThemedText style={styles.countText}>
              {savedSearchCount}/{maxSavedSearches === -1 ? '∞' : maxSavedSearches}
            </ThemedText>
          </View>
        </View>
        <ThemedText style={styles.subtitle}>
          Manage your saved search criteria and get notified of new matches
        </ThemedText>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {savedSearches.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <Ionicons name="search" size={64} color="#D1D5DB" />
            <ThemedText style={styles.emptyTitle}>No Saved Searches</ThemedText>
            <ThemedText style={styles.emptyText}>
              Save your search criteria to get notified when new properties match your requirements
            </ThemedText>
          </ThemedView>
        ) : (
          savedSearches.map((search) => (
            <SavedSearchCard
              key={search.id}
              search={search}
              onDelete={handleDeleteSearch}
              onToggleActive={handleToggleActive}
              onRunSearch={handleRunSearch}
              formatSearchCriteria={formatSearchCriteria}
            />
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
};

interface SavedSearchCardProps {
  search: SavedSearch;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, currentActive: boolean) => void;
  onRunSearch: (criteria: any) => void;
  formatSearchCriteria: (criteria: any) => string;
}

const SavedSearchCard: React.FC<SavedSearchCardProps> = ({
  search,
  onDelete,
  onToggleActive,
  onRunSearch,
  formatSearchCriteria,
}) => {
  const primaryColor = useThemeColor({}, 'tint');

  return (
    <ThemedView style={[
      styles.searchCard,
      { opacity: search.is_active ? 1 : 0.7 }
    ]}>
      <View style={styles.searchHeader}>
        <View style={styles.searchTitleContainer}>
          <ThemedText style={styles.searchTitle}>{search.search_name}</ThemedText>
          <View style={[
            styles.statusBadge,
            { backgroundColor: search.is_active ? primaryColor : '#9CA3AF' }
          ]}>
            <ThemedText style={styles.statusText}>
              {search.is_active ? 'Active' : 'Inactive'}
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(search.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ThemedText style={styles.searchCriteria}>
        {formatSearchCriteria(search.search_criteria)}
      </ThemedText>

      <View style={styles.searchFooter}>
        <ThemedText style={styles.searchDate}>
          Created: {new Date(search.created_at).toLocaleDateString()}
        </ThemedText>
        <View style={styles.searchActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#F3F4F6' }]}
            onPress={() => onToggleActive(search.id, search.is_active)}
          >
            <Ionicons 
              name={search.is_active ? "pause" : "play"} 
              size={14} 
              color="#6B7280" 
            />
            <ThemedText style={styles.actionButtonText}>
              {search.is_active ? 'Pause' : 'Activate'}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: primaryColor }]}
            onPress={() => onRunSearch(search.search_criteria)}
          >
            <Ionicons name="search" size={14} color="white" />
            <ThemedText style={[styles.actionButtonText, { color: 'white' }]}>
              Run Search
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 12,
  },
  countBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: 12,
    margin: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 32,
  },
  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  searchTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  deleteButton: {
    padding: 4,
  },
  searchCriteria: {
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.8,
  },
  searchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  searchActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});