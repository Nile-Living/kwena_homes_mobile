import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationsStore } from '@/store/notificationStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { Picker } from '@react-native-picker/picker';

// Define types for the search criteria and the overall search data state
type PropertyType = 'rent' | 'sale';

interface SearchCriteriaData {
  property_type?: PropertyType; // Undefined means "Any Type"
  category: string; // Empty string means "Any Category"
  location: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  min_square_meters?: number;
  max_square_meters?: number;
}

interface SearchDataState {
  name: string;
  criteria: SearchCriteriaData;
  notification_enabled: boolean;
  is_active: boolean;
}

// Define a more specific type for the initialCriteria prop
interface InitialCriteriaProp {
  name?: string;
  criteria?: Partial<SearchCriteriaData>;
  notification_enabled?: boolean;
  // is_active is internally managed, not typically part of initialCriteria from props
}

interface SaveSearchModalProps {
  visible: boolean;
  onClose: () => void;
  initialCriteria?: InitialCriteriaProp; // Use the more specific type
}

export default function SaveSearchModal({
  visible,
  onClose,
  initialCriteria,
}: SaveSearchModalProps) {
  const { createSavedSearch, isRegularUser } = useNotificationsStore();
  const { isSubscribed, fetchSubscriptionStatus, checkCanSaveMoreSearches } =
    useSubscriptionStore();
  const [loading, setLoading] = useState(false);
  const [canSaveMore, setCanSaveMore] = useState(false);
  const [searchLimit, setSearchLimit] = useState({
    currentCount: 0,
    maxAllowed: 0,
  });

  const [searchData, setSearchData] = useState<SearchDataState>(() => {
    const defaultState: SearchDataState = {
      name: '',
      criteria: {
        property_type: undefined, // Default for "Any Type" Picker item
        category: '', // Default for "Any Category" Picker item
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
    };

    if (initialCriteria) {
      return {
        ...defaultState,
        name: initialCriteria.name ?? defaultState.name,
        notification_enabled:
          initialCriteria.notification_enabled ??
          defaultState.notification_enabled,
        criteria: {
          ...defaultState.criteria,
          ...(initialCriteria.criteria || {}),
        },
      };
    }
    return defaultState;
  });

  useEffect(() => {
    if (visible) {
      // Reset state based on initialCriteria when modal becomes visible,
      // or simply re-evaluate initial state if initialCriteria changes.
      // This re-initialization logic might need adjustment based on desired behavior
      // if initialCriteria can change while the modal is already mounted but hidden.
      // For now, we assume initialCriteria is somewhat stable per modal opening.
      const defaultState: SearchDataState = {
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
      };
       if (initialCriteria) {
        setSearchData({
          ...defaultState,
          name: initialCriteria.name ?? defaultState.name,
          notification_enabled:
            initialCriteria.notification_enabled ??
            defaultState.notification_enabled,
          criteria: {
            ...defaultState.criteria,
            ...(initialCriteria.criteria || {}),
          },
        });
      } else {
        setSearchData(defaultState);
      }


      if (isRegularUser()) {
        fetchSubscriptionStatus();
        checkLimits();
      }
    }
  }, [visible, initialCriteria, isRegularUser]); // Added initialCriteria and isRegularUser to dependency array

  const checkLimits = async () => {
    try {
      const limitData = await checkCanSaveMoreSearches();
      setCanSaveMore(limitData.canSave);
      setSearchLimit({
        currentCount: limitData.currentCount,
        maxAllowed: limitData.maxAllowed,
      });
    } catch (error) {
      console.error('Error checking search limits:', error);
    }
  };

  const handleSave = async () => {
    if (!searchData.name.trim()) {
      Alert.alert('Error', 'Please enter a name for your search');
      return;
    }

    if (!isSubscribed) {
      Alert.alert(
        'Subscription Required',
        'You need an active subscription to save searches and receive notifications.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Subscribe',
            onPress: () => {
              onClose();
              // Potentially navigate to subscription page
            },
          },
        ],
      );
      return;
    }

    if (!canSaveMore) {
      Alert.alert(
        'Search Limit Reached',
        `You have reached your maximum of ${searchLimit.maxAllowed} saved searches. Please upgrade your subscription or delete existing searches.`,
        [{ text: 'OK', style: 'default' }],
      );
      return;
    }

    setLoading(true);
    try {
      const cleanCriteria = Object.fromEntries(
        Object.entries(searchData.criteria).filter(
          ([_, value]) => value !== undefined && value !== '',
        ),
      ) as Partial<SearchCriteriaData>; // Add type assertion for clarity

      await createSavedSearch({
        name: searchData.name,
        criteria: cleanCriteria,
        notification_enabled: searchData.notification_enabled,
        is_active: true, // is_active is true when saving
      });

      Alert.alert('Success', 'Search saved successfully!');
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save search');
    } finally {
      setLoading(false);
    }
  };

  if (!isRegularUser()) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-white justify-center items-center p-6">
          <Ionicons name="person-outline" size={64} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 mb-2">
            For Users Only
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            Saved searches are available for regular users only.
          </Text>
          <TouchableOpacity
            onPress={onClose}
            className="bg-blue-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold">Save Search</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading || !canSaveMore}
            className={`px-4 py-2 rounded-lg ${
              loading || !canSaveMore ? 'bg-gray-300' : 'bg-blue-500'
            }`}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-medium">Save</Text>
            )}
          </TouchableOpacity>
        </View>

        {isSubscribed && (
          <View className="px-4 py-2 bg-blue-50 border-b border-blue-200">
            <Text className="text-blue-800 text-sm">
              Saved searches:{' '}
              {searchLimit.currentCount}/
              {searchLimit.maxAllowed === -1 ? '∞' : searchLimit.maxAllowed}
            </Text>
          </View>
        )}

        <ScrollView className="flex-1 p-4">
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Search Name *
            </Text>
            <TextInput
              value={searchData.name}
              onChangeText={(text: string) =>
                setSearchData((prev: SearchDataState) => ({
                  ...prev,
                  name: text,
                }))
              }
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
                selectedValue={searchData.criteria.property_type}
                onValueChange={(value: PropertyType | undefined) =>
                  setSearchData((prev: SearchDataState) => ({
                    ...prev,
                    criteria: { ...prev.criteria, property_type: value },
                  }))
                }
              >
                <Picker.Item label="Any Type" value={undefined} />
                <Picker.Item label="For Rent" value="rent" />
                <Picker.Item label="For Sale" value="sale" />
              </Picker>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Category
            </Text>
            <View className="border border-gray-300 rounded-lg">
              <Picker
                selectedValue={searchData.criteria.category}
                onValueChange={(value: string) =>
                  setSearchData((prev: SearchDataState) => ({
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
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Location
            </Text>
            <TextInput
              value={searchData.criteria.location}
              onChangeText={(text: string) =>
                setSearchData((prev: SearchDataState) => ({
                  ...prev,
                  criteria: { ...prev.criteria, location: text },
                }))
              }
              placeholder="e.g. Roma, Lusaka"
              className="border border-gray-300 rounded-lg p-3 text-base"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Price Range (K)
            </Text>
            <View className="flex-row space-x-2">
              <TextInput
                value={searchData.criteria.min_price?.toString() || ''}
                onChangeText={(text: string) =>
                  setSearchData((prev: SearchDataState) => ({
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
                value={searchData.criteria.max_price?.toString() || ''}
                onChangeText={(text: string) =>
                  setSearchData((prev: SearchDataState) => ({
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
              <View className="flex-1">
                <TextInput
                  value={searchData.criteria.bedrooms?.toString() || ''}
                  onChangeText={(text: string) =>
                    setSearchData((prev: SearchDataState) => ({
                      ...prev,
                      criteria: {
                        ...prev.criteria,
                        bedrooms: text ? parseInt(text, 10) : undefined,
                      },
                    }))
                  }
                  placeholder="Bedrooms"
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-lg p-3 text-base"
                />
              </View>
              <View className="flex-1">
                <TextInput
                  value={searchData.criteria.bathrooms?.toString() || ''}
                  onChangeText={(text: string) =>
                    setSearchData((prev: SearchDataState) => ({
                      ...prev,
                      criteria: {
                        ...prev.criteria,
                        bathrooms: text ? parseInt(text, 10) : undefined,
                      },
                    }))
                  }
                  placeholder="Bathrooms"
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-lg p-3 text-base"
                />
              </View>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Area Range (sqm)
            </Text>
            <View className="flex-row space-x-2">
              <TextInput
                value={
                  searchData.criteria.min_square_meters?.toString() || ''
                }
                onChangeText={(text: string) =>
                  setSearchData((prev: SearchDataState) => ({
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
                value={
                  searchData.criteria.max_square_meters?.toString() || ''
                }
                onChangeText={(text: string) =>
                  setSearchData((prev: SearchDataState) => ({
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

          <View className="mb-6">
            <View className="flex-row items-center justify-between p-3 border border-gray-200 rounded-lg">
              <Text className="text-base text-gray-700">
                Enable Notifications
              </Text>
              <Switch
                value={searchData.notification_enabled}
                onValueChange={(value: boolean) =>
                  setSearchData((prev: SearchDataState) => ({
                    ...prev,
                    notification_enabled: value,
                  }))
                }
              />
            </View>
          </View>

          {!isSubscribed && (
            <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <Text className="text-yellow-800 text-sm">
                💡 You need an active subscription to save searches and receive
                notifications about new properties.
              </Text>
            </View>
          )}

          {isSubscribed && !canSaveMore && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <Text className="text-red-800 text-sm">
                ⚠️ You have reached your saved search limit (
                {searchLimit.maxAllowed}). Upgrade your subscription or delete
                existing searches.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
