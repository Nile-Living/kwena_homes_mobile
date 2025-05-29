import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Switch,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useNotificationsStore, SavedSearch } from '@/store/notificationStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { ALL_COMPOUNDS } from '@/constants/Locations';

type PropertyType = 'rent' | 'sale';

interface SearchCriteriaData {
  property_type?: PropertyType;
  category: string;
  location: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  min_square_meters?: number;
  max_square_meters?: number;
}

interface SearchFormData {
  name: string;
  criteria: SearchCriteriaData;
  notification_enabled: boolean;
  is_active: boolean;
}

interface SearchFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: SearchFormData) => Promise<void>;
  initialData?: SavedSearch | null;
  loading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({
  visible,
  onClose,
  onSave,
  initialData,
  loading,
}) => {
  const [formData, setFormData] = useState<SearchFormData>({
    name: '',
    criteria: {
      property_type: undefined,
      category: '',
      location: '',
      min_price: undefined,
      max_price: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      min_square_meters: undefined,
      max_square_meters: undefined,
    },
    notification_enabled: true,
    is_active: true,
  });

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          criteria: {
            ...(initialData.criteria as SearchCriteriaData),
            location: initialData.criteria.location || '',
          },
          notification_enabled: initialData.notification_enabled,
          is_active: initialData.is_active,
        });
      } else {
        setFormData({
          name: '',
          criteria: {
            property_type: undefined,
            category: '',
            location: '',
            min_price: undefined,
            max_price: undefined,
            bedrooms: undefined,
            bathrooms: undefined,
            min_square_meters: undefined,
            max_square_meters: undefined,
          },
          notification_enabled: true,
          is_active: true,
        });
      }
    }
  }, [visible, initialData]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a name for your search');
      return;
    }
    const criteriaToSave = {
      ...formData.criteria,
      location: formData.criteria.location === '' ? undefined : formData.criteria.location,
    };
    await onSave({ ...formData, criteria: criteriaToSave as SearchCriteriaData });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold">
            {initialData ? 'Edit Search' : 'New Search'}
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            className={`px-4 py-2 rounded-lg ${loading ? 'bg-gray-300' : 'bg-blue-500'}`}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-medium">Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Search Name *
            </Text>
            <TextInput
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="e.g. 3-bed houses in Roma"
              className="border border-gray-300 rounded-lg p-3 text-base"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Property Type
            </Text>
            <View className="border border-gray-300 rounded-lg">
              <Picker
                selectedValue={formData.criteria.property_type}
                onValueChange={(value) =>
                  setFormData(prev => ({
                    ...prev,
                    criteria: { ...prev.criteria, property_type: value || undefined },
                  }))
                }
              >
                <Picker.Item label="Any Type" value="" />
                <Picker.Item label="For Rent" value="rent" />
                <Picker.Item label="For Sale" value="sale" />
              </Picker>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Category</Text>
            <View className="border border-gray-300 rounded-lg">
              <Picker
                selectedValue={formData.criteria.category}
                onValueChange={(value) =>
                  setFormData(prev => ({
                    ...prev,
                    criteria: { ...prev.criteria, category: value },
                  }))
                }
              >
                <Picker.Item label="Any Category" value="" />
                <Picker.Item label="House" value="house" />
                <Picker.Item label="Apartment" value="apartment" />
                <Picker.Item label="Land" value="land" />
                <Picker.Item label="Commercial" value="commercial" />
              </Picker>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Location</Text>
            <View className="border border-gray-300 rounded-lg">
              <Picker
                selectedValue={formData.criteria.location}
                onValueChange={(itemValue) =>
                  setFormData(prev => ({
                    ...prev,
                    criteria: { ...prev.criteria, location: itemValue as string },
                  }))
                }
              >
                <Picker.Item label="Any Location" value="" />
                {ALL_COMPOUNDS.map((compound) => (
                  <Picker.Item key={compound} label={compound} value={compound} />
                ))}
              </Picker>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Price Range (K)
            </Text>
            <View className="flex-row space-x-2">
              <TextInput
                value={formData.criteria.min_price?.toString() || ''}
                onChangeText={(text) =>
                  setFormData(prev => ({
                    ...prev,
                    criteria: {
                      ...prev.criteria,
                      min_price: text ? parseFloat(text) : undefined,
                    },
                  }))
                }
                placeholder="Min price"
                keyboardType="numeric"
                className="flex-1 border border-gray-300 rounded-lg p-3 text-base"
              />
              <TextInput
                value={formData.criteria.max_price?.toString() || ''}
                onChangeText={(text) =>
                  setFormData(prev => ({
                    ...prev,
                    criteria: {
                      ...prev.criteria,
                      max_price: text ? parseFloat(text) : undefined,
                    },
                  }))
                }
                placeholder="Max price"
                keyboardType="numeric"
                className="flex-1 border border-gray-300 rounded-lg p-3 text-base"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Bedrooms & Bathrooms
            </Text>
            <View className="flex-row space-x-2">
              <TextInput
                value={formData.criteria.bedrooms?.toString() || ''}
                onChangeText={(text) =>
                  setFormData(prev => ({
                    ...prev,
                    criteria: {
                      ...prev.criteria,
                      bedrooms: text ? parseInt(text, 10) : undefined,
                    },
                  }))
                }
                placeholder="Bedrooms"
                keyboardType="numeric"
                className="flex-1 border border-gray-300 rounded-lg p-3 text-base"
              />
              <TextInput
                value={formData.criteria.bathrooms?.toString() || ''}
                onChangeText={(text) =>
                  setFormData(prev => ({
                    ...prev,
                    criteria: {
                      ...prev.criteria,
                      bathrooms: text ? parseInt(text, 10) : undefined,
                    },
                  }))
                }
                placeholder="Bathrooms"
                keyboardType="numeric"
                className="flex-1 border border-gray-300 rounded-lg p-3 text-base"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Area Range (sqm)
            </Text>
            <View className="flex-row space-x-2">
              <TextInput
                value={formData.criteria.min_square_meters?.toString() || ''}
                onChangeText={(text) =>
                  setFormData(prev => ({
                    ...prev,
                    criteria: {
                      ...prev.criteria,
                      min_square_meters: text ? parseFloat(text) : undefined,
                    },
                  }))
                }
                placeholder="Min area"
                keyboardType="numeric"
                className="flex-1 border border-gray-300 rounded-lg p-3 text-base"
              />
              <TextInput
                value={formData.criteria.max_square_meters?.toString() || ''}
                onChangeText={(text) =>
                  setFormData(prev => ({
                    ...prev,
                    criteria: {
                      ...prev.criteria,
                      max_square_meters: text ? parseFloat(text) : undefined,
                    },
                  }))
                }
                placeholder="Max area"
                keyboardType="numeric"
                className="flex-1 border border-gray-300 rounded-lg p-3 text-base"
              />
            </View>
          </View>

          <View className="mb-4">
            <View className="flex-row items-center justify-between p-3 border border-gray-200 rounded-lg mb-2">
              <Text className="text-base text-gray-700">Enable Notifications</Text>
              <Switch
                value={formData.notification_enabled}
                onValueChange={(value) =>
                  setFormData(prev => ({ ...prev, notification_enabled: value }))
                }
              />
            </View>

            <View className="flex-row items-center justify-between p-3 border border-gray-200 rounded-lg">
              <Text className="text-base text-gray-700">Active Search</Text>
              <Switch
                value={formData.is_active}
                onValueChange={(value) =>
                  setFormData(prev => ({ ...prev, is_active: value }))
                }
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default function SavedSearchesScreen() {
  const {
    savedSearches,
    loadingSavedSearches,
    errorSavedSearches,
    fetchSavedSearches,
    createSavedSearch,
    updateSavedSearch,
    deleteSavedSearch,
    isRegularUser,
  } = useNotificationsStore();

  const { isSubscribed, checkCanSaveMoreSearches } = useSubscriptionStore();

  const [showForm, setShowForm] = useState(false);
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchLimits, setSearchLimits] = useState({
    canSave: false,
    currentCount: 0,
    maxAllowed: 0,
  });

  useEffect(() => {
    if (isRegularUser()) {
      fetchSavedSearches();
      checkLimits();
    }
  }, []);

  const checkLimits = async () => {
    try {
      const limits = await checkCanSaveMoreSearches();
      setSearchLimits(limits);
    } catch (error) {
      console.error('Error checking limits:', error);
    }
  };

  const handleCreateSearch = async (formData: SearchFormData) => {
    if (!isSubscribed) {
      Alert.alert(
        'Subscription Required',
        'You need an active subscription to save searches.',
      );
      return;
    }

    if (!searchLimits.canSave) {
      Alert.alert(
        'Limit Reached',
        `You have reached your maximum of ${searchLimits.maxAllowed} saved searches.`,
      );
      return;
    }

    setFormLoading(true);
    try {
      const cleanCriteria = Object.fromEntries(
        Object.entries(formData.criteria).filter(
          ([key, value]) => {
            if (key === 'location') return value !== undefined && value !== '';
            return value !== undefined && value !== '';
          }
        ),
      );

      await createSavedSearch({
        name: formData.name,
        criteria: cleanCriteria,
        notification_enabled: formData.notification_enabled,
        is_active: formData.is_active,
      });

      Alert.alert('Success', 'Search saved successfully!');
      setShowForm(false);
      await fetchSavedSearches();
      await checkLimits();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save search');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateSearch = async (formData: SearchFormData) => {
    if (!editingSearch) return;

    setFormLoading(true);
    try {
      const cleanCriteria = Object.fromEntries(
        Object.entries(formData.criteria).filter(
          ([key, value]) => {
            if (key === 'location') return value !== undefined && value !== '';
            return value !== undefined && value !== '';
          }
        ),
      );

      await updateSavedSearch(editingSearch.id, {
        name: formData.name,
        criteria: cleanCriteria,
        notification_enabled: formData.notification_enabled,
        is_active: formData.is_active,
      });

      Alert.alert('Success', 'Search updated successfully!');
      setShowForm(false);
      setEditingSearch(null);
      await fetchSavedSearches();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update search');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSearch = (search: SavedSearch) => {
    Alert.alert(
      'Delete Search',
      `Are you sure you want to delete "${search.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSavedSearch(search.id);
              Alert.alert('Success', 'Search deleted successfully');
              await fetchSavedSearches();
              await checkLimits();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete search');
            }
          },
        },
      ],
    );
  };

  const openEditForm = (search: SavedSearch) => {
    setEditingSearch(search);
    setShowForm(true);
  };

  const openCreateForm = () => {
    setEditingSearch(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSearch(null);
  };

  const getCriteriaDisplay = (criteria: any) => {
    const parts = [];
    if (criteria.property_type) {
      parts.push(`For ${criteria.property_type}`);
    }
    if (criteria.category) {
      parts.push(criteria.category);
    }
    if (criteria.location) {
      parts.push(`in ${criteria.location}`);
    }
    if (criteria.min_price || criteria.max_price) {
      const minPrice = criteria.min_price ? `K${criteria.min_price}` : '';
      const maxPrice = criteria.max_price ? `K${criteria.max_price}` : '';
      if (minPrice && maxPrice) {
        parts.push(`${minPrice} - ${maxPrice}`);
      } else if (minPrice) {
        parts.push(`from ${minPrice}`);
      } else if (maxPrice) {
        parts.push(`up to ${maxPrice}`);
      }
    }
    if (criteria.bedrooms) {
      parts.push(`${criteria.bedrooms} bed`);
    }
    return parts.join(' • ') || 'All properties';
  };

  if (!isRegularUser()) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="person-outline" size={64} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 mb-2">
            For Users Only
          </Text>
          <Text className="text-gray-600 text-center">
            Saved searches are available for regular users only.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Saved Searches</Text>
        <TouchableOpacity
          onPress={openCreateForm}
          disabled={!isSubscribed || !searchLimits.canSave}
          className={`p-2 rounded-lg ${
            !isSubscribed || !searchLimits.canSave ? 'bg-gray-300' : 'bg-blue-500'
          }`}
        >
          <Ionicons
            name="add"
            size={24}
            color={!isSubscribed || !searchLimits.canSave ? '#9CA3AF' : 'white'}
          />
        </TouchableOpacity>
      </View>

      {isSubscribed && (
        <View className="px-4 py-2 bg-blue-50 border-b border-blue-200">
          <Text className="text-blue-800 text-sm">
            {searchLimits.currentCount}/{searchLimits.maxAllowed === -1 ? '∞' : searchLimits.maxAllowed} searches saved
          </Text>
        </View>
      )}

      {!isSubscribed && (
        <View className="m-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <View className="flex-row items-center">
            <Ionicons name="information-circle" size={20} color="#F59E0B" />
            <Text className="text-yellow-800 font-medium ml-2">
              Subscription Required
            </Text>
          </View>
          <Text className="text-yellow-700 mt-2">
            Subscribe to save searches and get property alerts.
          </Text>
        </View>
      )}

      {loadingSavedSearches ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading saved searches...</Text>
        </View>
      ) : errorSavedSearches ? (
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text className="text-red-600 mt-4 text-center">{errorSavedSearches}</Text>
          <TouchableOpacity
            onPress={() => {
              fetchSavedSearches();
              checkLimits();
            }}
            className="bg-blue-500 px-4 py-2 rounded-lg mt-4"
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : savedSearches.length === 0 ? (
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="search" size={64} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 mb-2">
            No Saved Searches
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            Save your favorite search criteria to get notified about new properties.
          </Text>
          {isSubscribed && searchLimits.canSave && (
            <TouchableOpacity
              onPress={openCreateForm}
              className="bg-blue-500 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold">Create Your First Search</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView className="flex-1 p-4">
          {savedSearches.map((search) => (
            <View key={search.id} className="bg-white rounded-lg p-4 shadow-sm mb-3">
              <View className="flex-row items-start justify-between mb-2">
                <Text className="text-lg font-semibold text-gray-900 flex-1">
                  {search.name}
                </Text>
                <View className="flex-row items-center ml-2">
                  <View className={`px-2 py-1 rounded-full mr-2 ${
                    search.is_active ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Text className={`text-xs font-medium ${
                      search.is_active ? 'text-green-800' : 'text-gray-600'
                    }`}>
                      {search.is_active ? 'Active' : 'Paused'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => openEditForm(search)}
                    className="p-1"
                  >
                    <Ionicons name="create-outline" size={20} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteSearch(search)}
                    className="p-1 ml-1"
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text className="text-gray-600 mb-3">
                {getCriteriaDisplay(search.criteria)}
              </Text>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons
                    name={search.notification_enabled ? "notifications" : "notifications-off"}
                    size={16}
                    color={search.notification_enabled ? "#10B981" : "#9CA3AF"}
                  />
                  <Text className={`text-sm ml-1 ${
                    search.notification_enabled ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {search.notification_enabled ? 'Notifications on' : 'Notifications off'}
                  </Text>
                </View>

                <Text className="text-gray-500 text-sm">
                  {new Date(search.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <SearchForm
        visible={showForm}
        onClose={closeForm}
        onSave={editingSearch ? handleUpdateSearch : handleCreateSearch}
        initialData={editingSearch}
        loading={formLoading}
      />
    </SafeAreaView>
  );
}
