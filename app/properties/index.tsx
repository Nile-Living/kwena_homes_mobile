import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  TextInput,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore, Property } from '@/store/useStore';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/supabaseClient';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from "expo-router";

// Property status types
type PropertyStatus = 
  | 'available' 
  | 'occupied' 
  | 'rented' 
  | 'off-market' 
  | 'under-maintenance' 
  | 'pending-approval';

interface PropertyAction {
  label: string;
  icon: string;
  action: (property: Property) => void;
}

interface StatusOption {
  value: PropertyStatus;
  label: string;
  color: string;
  icon: string;
}

// Component for My Properties Page
const MyPropertiesPage: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'all'>('all');
  const [sortOption, setSortOption] = useState<'price' | 'date' | 'alphabetical'>('date');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  // Status options with colors and icons
  const statusOptions: StatusOption[] = [
    { value: 'available', label: 'Available', color: '#4CAF50', icon: 'checkmark-circle' },
    { value: 'occupied', label: 'Occupied', color: '#FF9800', icon: 'home' },
    { value: 'rented', label: 'Rented Out', color: '#2196F3', icon: 'cash' },
    { value: 'off-market', label: 'Off Market', color: '#9E9E9E', icon: 'eye-off' },
    { value: 'under-maintenance', label: 'Under Maintenance', color: '#FFC107', icon: 'construct' },
    { value: 'pending-approval', label: 'Pending Approval', color: '#673AB7', icon: 'time' },
  ];

  const router = useRouter();

  // Fetch user's properties from Supabase
  const fetchUserProperties = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Query properties table where user_id matches current user
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Add status field to properties (create property_status table or use existing if available)
      const propertiesWithStatus = await addStatusToProperties(data);
      setProperties(propertiesWithStatus);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load your properties. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Add status to properties by checking property_status table
  const addStatusToProperties = async (propertiesData: Property[]) => {
    try {
      let statusData: { property_id: string; status: PropertyStatus }[] = [];
      try {
        // Attempt to fetch statuses
        const { data, error } = await supabase
          .from('property_status')
          .select('property_id, status')
          .in('property_id', propertiesData.map(p => p.id));
        if (error) throw error;
        statusData = data as { property_id: string; status: PropertyStatus }[];
      } catch (err) {
        // If table doesn't exist, create it and set defaults
        await createPropertyStatusTable();
        // Insert default statuses
        const statusEntries = propertiesData.map(property => ({
          property_id: property.id,
          status: 'available' as PropertyStatus,
          last_updated: new Date().toISOString()
        }));
        await supabase.from('property_status').insert(statusEntries);
        statusData = statusEntries;
      }
  
      const statusMap = new Map(
        statusData.map((item) => [item.property_id, item.status])
      );
      
      return propertiesData.map(property => ({
        ...property,
        status: (statusMap.get(property.id) || 'available') as PropertyStatus
      }));
    } catch (err) {
      console.error('Error adding status to properties:', err);
      return propertiesData.map(property => ({
        ...property,
        status: 'available' as PropertyStatus
      }));
    }
  };

  // Create property_status table if it doesn't exist
  const createPropertyStatusTable = async () => {
    try {
      // Check if table exists first
      const { error: checkError } = await supabase
        .from('property_status')
        .select('count')
        .limit(1);

      if (checkError) {
        // Create the table using SQL
        const { error } = await supabase.rpc('create_property_status_table', {});
        
        if (error) throw error;
      }
    } catch (err) {
      console.error('Error creating property_status table:', err);
    }
  };

  // Property actions
  const propertyActions: PropertyAction[] = [
    { 
      label: 'Edit Details', 
      icon: 'create-outline', 
      action: (property) => handleEditProperty(property)
    },
    { 
      label: 'Change Status', 
      icon: 'swap-horizontal-outline', 
      action: (property) => {
        setSelectedProperty(property);
        setStatusModalVisible(true);
      } 
    },
    { 
      label: 'View Inquiries', 
      icon: 'chatbubble-ellipses-outline', 
      action: (property) => Alert.alert('Coming Soon', 'This feature will be available in a future update.')
    },
    { 
      label: 'Promote Listing', 
      icon: 'megaphone-outline', 
      action: (property) => Alert.alert('Coming Soon', 'This feature will be available in a future update.')
    },
    { 
      label: 'Delete Listing', 
      icon: 'trash-outline', 
      action: (property) => {
        setSelectedProperty(property);
        setIsDeleteModalVisible(true);
      } 
    },
  ];

  // Navigate to edit property screen
  const handleEditProperty = (property: Property) => {
    // @ts-ignore - Navigation type might need to be properly defined
    navigation.navigate('EditProperty', { propertyId: property.id });
  };

  // Update property status
  const updatePropertyStatus = async (propertyId: string, newStatus: PropertyStatus) => {
    if (!user) return;
    
    try {
      // Update status in property_status table
      const { error } = await supabase
        .from('property_status')
        .upsert({
          property_id: propertyId,
          status: newStatus,
          last_updated: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Update local state
      setProperties(properties.map(property => 
        property.id === propertyId 
          ? {...property, status: newStatus} 
          : property
      ));
      
      setStatusModalVisible(false);
      Alert.alert('Success', 'Property status updated successfully');
    } catch (err) {
      console.error('Error updating property status:', err);
      Alert.alert('Error', 'Failed to update property status. Please try again.');
    }
  };

  // Delete property
  const handleDeleteProperty = async () => {
    if (!selectedProperty || !user) return;
    
    try {
      // Delete from property_status table first (if it exists)
      await supabase
        .from('property_status')
        .delete()
        .eq('property_id', selectedProperty.id);
      
      // Delete from saved_properties table
      await supabase
        .from('saved_properties')
        .delete()
        .eq('property_id', selectedProperty.id);
      
      // Delete from properties table
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', selectedProperty.id)
        .eq('user_id', user.id); // Ensure the property belongs to the user
      
      if (error) throw error;
      
      // Update local state
      setProperties(properties.filter(property => property.id !== selectedProperty.id));
      setIsDeleteModalVisible(false);
      Alert.alert('Success', 'Property deleted successfully');
    } catch (err) {
      console.error('Error deleting property:', err);
      Alert.alert('Error', 'Failed to delete property. Please try again.');
    }
  };

  // Get filtered properties
  const getFilteredProperties = () => {
    let filtered = [...properties];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        property => 
          property.title.toLowerCase().includes(query) || 
          property.location.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(property => property.status === statusFilter);
    }
    
    // Apply sorting
    switch(sortOption) {
      case 'price':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'date':
        filtered.sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    
    return filtered;
  };

  // Get status details by value
  const getStatusDetails = (status: PropertyStatus): StatusOption => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
  };

  // Load properties when component mounts
  useEffect(() => {
    fetchUserProperties();
  }, [user]);

  // Render each property card
  const renderProperty = ({ item }: { item: Property }) => {
    const statusDetails = getStatusDetails(item.status as PropertyStatus);
    
    return (
      <View className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
        <View className="relative">
          {/* Property Image */}
          <Image
            source={{ 
              uri: item.images && item.images.length > 0
                ? item.images[0]
                : 'https://picsum.photos/600/400' // Placeholder image
            }}
            className="w-full h-48"
            resizeMode="cover"
          />
          
          {/* Status Badge */}
          <View 
            className="absolute top-2 right-2 px-3 py-1 rounded-full flex-row items-center" 
            style={{ backgroundColor: statusDetails.color + 'E6' }}
          >
            <Ionicons name={statusDetails.icon as any} size={16} color="white" />
            <Text className="text-white font-medium ml-1">{statusDetails.label}</Text>
          </View>
          
          {/* Property Type Badge */}
          <View className="absolute top-2 left-2 bg-amber-500 px-3 py-1 rounded-full">
            <Text className="text-white font-medium capitalize">
              {item.property_type === 'rent' ? 'For Rent' : 'For Sale'}
            </Text>
          </View>
        </View>
        
        {/* Property Details */}
        <View className="p-4">
          <Text className="text-xl font-bold text-gray-800">{item.title}</Text>
          <Text className="text-gray-600 mb-2">{item.location}</Text>
          
          <View className="flex-row justify-between mb-3">
            <View className="flex-row items-center">
              <Ionicons name="bed-outline" size={18} color="#666" />
              <Text className="text-gray-700 ml-1">{item.bedrooms}</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="water-outline" size={18} color="#666" />
              <Text className="text-gray-700 ml-1">{item.bathrooms}</Text>
            </View>
            {item.garages !== undefined && (
              <View className="flex-row items-center">
                <Ionicons name="car-outline" size={18} color="#666" />
                <Text className="text-gray-700 ml-1">{item.garages}</Text>
              </View>
            )}
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="home-outline" size={18} color="#666" />
              <Text className="text-gray-700 ml-1 capitalize">{item.category || 'Property'}</Text>
            </View>
          </View>
          
          <View className="flex-row items-center mb-3">
            <Text className="text-xl font-bold text-indigo-600">K{item.price}/mo</Text>
            <Text className="text-gray-500 text-xs ml-2">
              Posted: {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
          
          {/* Action Buttons */}
          <View className="flex-row flex-wrap">
            {propertyActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                className={`py-2 px-3 rounded-full mr-2 mb-2 flex-row items-center ${
                  action.label === 'Delete Listing' 
                    ? 'bg-red-100' 
                    : action.label === 'Change Status' 
                      ? 'bg-indigo-100' 
                      : 'bg-gray-100'
                }`}
                onPress={() => action.action(item)}
              >
                <Ionicons 
                  name={action.icon as any} 
                  size={16} 
                  color={
                    action.label === 'Delete Listing' 
                      ? '#DC2626' 
                      : action.label === 'Change Status' 
                        ? '#4F46E5' 
                        : '#4B5563'
                  } 
                />
                <Text 
                  className={`ml-1 text-sm font-medium ${
                    action.label === 'Delete Listing' 
                      ? 'text-red-600' 
                      : action.label === 'Change Status' 
                        ? 'text-indigo-600' 
                        : 'text-gray-600'
                  }`}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-green-800 pt-4 pb-4 px-4">
  <View className="flex-row justify-between items-center">
    {/* Search Bar */}
    <View className="flex-row flex-1 items-center bg-white rounded-lg px-3 py-2">
      <Ionicons name="search-outline" size={20} color="#6B7280" />
      <TextInput
        className="flex-1 ml-2 text-gray-800"
        placeholder="Search properties..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#9CA3AF"
      />
      {searchQuery !== '' && (
        <TouchableOpacity onPress={() => setSearchQuery('')}>
          <Ionicons name="close-circle" size={20} color="#6B7280" />
        </TouchableOpacity>
      )}
    </View>

    {/* Add Property Button */}
    <TouchableOpacity 
      className="bg-white bg-opacity-20 p-2 rounded-full ml-2"
      onPress={() => router.push("/property/new")}
    >
      <Ionicons name="add" size={24} color="black" />
    </TouchableOpacity>
  </View>
</View>

      
      {/* Filter Options */}
      <View className="bg-white px-4 py-3 flex-row justify-between items-center">
        <View className="flex-row">
          <Text className="text-gray-700 font-medium">Status: </Text>
          <TouchableOpacity 
            onPress={() => {
              // Create a modal for status filter or cycle through options
              const currentIndex = statusOptions.findIndex(option => option.value === statusFilter);
              const nextStatus = statusFilter === 'all' 
                ? statusOptions[0].value 
                : currentIndex < statusOptions.length - 1 
                  ? statusOptions[currentIndex + 1].value 
                  : 'all';
              setStatusFilter(nextStatus);
            }}
            className="flex-row items-center"
          >
            <Text className="text-indigo-600 font-medium">
              {statusFilter === 'all' 
                ? 'All Properties' 
                : getStatusDetails(statusFilter).label}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#4F46E5" />
          </TouchableOpacity>
        </View>
        
        <View className="flex-row">
          <Text className="text-gray-700 font-medium">Sort by: </Text>
          <TouchableOpacity 
            onPress={() => {
              // Cycle through sort options
              setSortOption(
                sortOption === 'date' 
                  ? 'price' 
                  : sortOption === 'price' 
                    ? 'alphabetical' 
                    : 'date'
              );
            }}
            className="flex-row items-center"
          >
            <Text className="text-indigo-600 font-medium">
              {sortOption === 'date' 
                ? 'Newest' 
                : sortOption === 'price' 
                  ? 'Price' 
                  : 'A-Z'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#4F46E5" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Loading State */}
      {loading && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="mt-4 text-gray-600">Loading your properties...</Text>
        </View>
      )}
      
      {/* Error State */}
      {error && !loading && (
        <View className="flex-1 justify-center items-center p-4">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="mt-4 text-gray-800 text-lg font-medium text-center">{error}</Text>
          <TouchableOpacity 
            className="mt-4 bg-indigo-600 px-4 py-2 rounded-lg"
            onPress={fetchUserProperties}
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Property List */}
      {!loading && !error && (
        <FlatList
          data={getFilteredProperties()}
          renderItem={renderProperty}
          keyExtractor={(item) => item.id}
          contentContainerClassName="p-4"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center p-8">
              <Ionicons name="home-outline" size={64} color="#D1D5DB" />
              <Text className="text-gray-400 text-lg font-medium mt-4 text-center">
                No properties found
              </Text>
              <Text className="text-gray-400 text-center mt-2">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'You haven\'t added any properties yet.'}
              </Text>
              <TouchableOpacity
                className="bg-indigo-600 px-4 py-2 rounded-lg mt-4"
                // @ts-ignore - Navigation type might need to be properly defined
                onPress={() => navigation.navigate('AddProperty')}
              >
                <Text className="text-white font-medium">Add New Property</Text>
              </TouchableOpacity>
            </View>
          }
          onRefresh={fetchUserProperties}
          refreshing={loading}
        />
      )}
      
      {/* Status Change Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={statusModalVisible}
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">Change Property Status</Text>
              <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            {selectedProperty && (
              <>
                <Text className="text-gray-600 mb-4">
                  Select a new status for "{selectedProperty.title}"
                </Text>
                
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    className={`flex-row items-center p-3 rounded-lg mb-2 ${
                      selectedProperty.status === option.value
                        ? 'bg-indigo-50 border border-indigo-200'
                        : 'border border-gray-200'
                    }`}
                    onPress={() => updatePropertyStatus(selectedProperty.id, option.value)}
                  >
                    <View 
                      className="w-8 h-8 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: option.color }}
                    >
                      <Ionicons name={option.icon as any} size={16} color="white" />
                    </View>
                    <Text 
                      className={`text-base font-medium ${
                        selectedProperty.status === option.value
                          ? 'text-indigo-700'
                          : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </Text>
                    {selectedProperty.status === option.value && (
                      <Ionicons 
                        name="checkmark-circle" 
                        size={20} 
                        color="#4F46E5" 
                        style={{ marginLeft: 'auto' }}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isDeleteModalVisible}
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white rounded-xl p-4 m-4 w-4/5">
            <View className="items-center mb-4">
              <Ionicons name="warning-outline" size={48} color="#EF4444" />
              <Text className="text-xl font-bold text-gray-800 mt-2">Delete Property</Text>
            </View>
            
            {selectedProperty && (
              <>
                <Text className="text-gray-600 mb-4 text-center">
                  Are you sure you want to delete "{selectedProperty.title}"? This action cannot be undone.
                </Text>
                
                <View className="flex-row justify-center mt-4">
                  <TouchableOpacity
                    className="bg-gray-200 px-4 py-2 rounded-lg mr-2"
                    onPress={() => setIsDeleteModalVisible(false)}
                  >
                    <Text className="text-gray-800 font-medium">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-red-600 px-4 py-2 rounded-lg"
                    onPress={handleDeleteProperty}
                  >
                    <Text className="text-white font-medium">Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MyPropertiesPage;