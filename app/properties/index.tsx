import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  TextInput,
  Modal,
  FlatList
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// TypeScript interfaces
type PropertyStatus = 
  | 'available' 
  | 'occupied' 
  | 'rented' 
  | 'off-market' 
  | 'under-maintenance' 
  | 'pending-approval';

type PropertyType = 
  | 'apartment' 
  | 'house' 
  | 'condo' 
  | 'townhouse' 
  | 'studio' 
  | 'commercial';

interface Property {
  id: string;
  title: string;
  address: string;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  price: number;
  status: PropertyStatus;
  imageUrl: string;
  featured: boolean;
  dateAdded: Date;
  lastUpdated: Date;
}

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
  // Sample properties data
  const [properties, setProperties] = useState<Property[]>([
    {
      id: '1',
      title: 'Modern Downtown Apartment',
      address: '123 Main St, Apt 4B, Downtown',
      type: 'apartment',
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1200,
      price: 2500,
      status: 'available',
      imageUrl: 'https://example.com/apartment1.jpg',
      featured: true,
      dateAdded: new Date('2024-01-15'),
      lastUpdated: new Date('2024-02-20'),
    },
    {
      id: '2',
      title: 'Cozy Studio near University',
      address: '456 College Ave, Unit 7, Collegetown',
      type: 'studio',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 650,
      price: 1200,
      status: 'rented',
      imageUrl: 'https://example.com/studio1.jpg',
      featured: false,
      dateAdded: new Date('2023-11-05'),
      lastUpdated: new Date('2024-01-10'),
    },
    {
      id: '3',
      title: 'Luxury Waterfront Condo',
      address: '789 Harbor View, Unit 12A, Waterfront',
      type: 'condo',
      bedrooms: 3,
      bathrooms: 2.5,
      squareFeet: 1800,
      price: 3800,
      status: 'occupied',
      imageUrl: 'https://example.com/condo1.jpg',
      featured: true,
      dateAdded: new Date('2023-12-20'),
      lastUpdated: new Date('2024-02-15'),
    },
    {
      id: '4',
      title: 'Suburban Family House',
      address: '567 Oak Lane, Suburb',
      type: 'house',
      bedrooms: 4,
      bathrooms: 3,
      squareFeet: 2400,
      price: 2800,
      status: 'under-maintenance',
      imageUrl: 'https://example.com/house1.jpg',
      featured: false,
      dateAdded: new Date('2023-10-10'),
      lastUpdated: new Date('2024-03-01'),
    },
  ]);

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'all'>('all');
  const [sortOption, setSortOption] = useState<'price' | 'date' | 'alphabetical'>('date');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  // Status options with colors and icons
  const statusOptions: StatusOption[] = [
    { value: 'available', label: 'Available', color: '#4CAF50', icon: 'checkmark-circle' },
    { value: 'occupied', label: 'Occupied', color: '#FF9800', icon: 'home' },
    { value: 'rented', label: 'Rented Out', color: '#2196F3', icon: 'cash' },
    { value: 'off-market', label: 'Off Market', color: '#9E9E9E', icon: 'eye-off' },
    { value: 'under-maintenance', label: 'Under Maintenance', color: '#FFC107', icon: 'construct' },
    { value: 'pending-approval', label: 'Pending Approval', color: '#673AB7', icon: 'time' },
  ];

  // Property actions
  const propertyActions: PropertyAction[] = [
    { 
      label: 'Edit Details', 
      icon: 'create-outline', 
      action: (property) => console.log('Edit property', property.id) 
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
      action: (property) => console.log('View inquiries for', property.id) 
    },
    { 
      label: 'Promote Listing', 
      icon: 'megaphone-outline', 
      action: (property) => console.log('Promote listing', property.id) 
    },
    { 
      label: 'Delete Listing', 
      icon: 'trash-outline', 
      action: (property) => console.log('Delete listing', property.id) 
    },
  ];

  // Update property status
  const updatePropertyStatus = (propertyId: string, newStatus: PropertyStatus) => {
    setProperties(properties.map(property => 
      property.id === propertyId 
        ? {...property, status: newStatus, lastUpdated: new Date()} 
        : property
    ));
    setStatusModalVisible(false);
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
          property.address.toLowerCase().includes(query)
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
        filtered.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
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

  // Render each property card
  const renderProperty = ({ item }: { item: Property }) => {
    const statusDetails = getStatusDetails(item.status);
    
    return (
      <View className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
        <View className="relative">
          {/* Property Image */}
          <Image
            source={{ uri: 'https://picsum.photos/600/400' }} // Placeholder image
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
          
          {/* Featured Badge */}
          {item.featured && (
            <View className="absolute top-2 left-2 bg-amber-500 px-3 py-1 rounded-full">
              <Text className="text-white font-medium">Featured</Text>
            </View>
          )}
        </View>
        
        {/* Property Details */}
        <View className="p-4">
          <Text className="text-xl font-bold text-gray-800">{item.title}</Text>
          <Text className="text-gray-600 mb-2">{item.address}</Text>
          
          <View className="flex-row justify-between mb-3">
            <View className="flex-row items-center">
              <Ionicons name="bed-outline" size={18} color="#666" />
              <Text className="text-gray-700 ml-1">{item.bedrooms}</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="water-outline" size={18} color="#666" />
              <Text className="text-gray-700 ml-1">{item.bathrooms}</Text>
            </View>
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="floor-plan" size={18} color="#666" />
              <Text className="text-gray-700 ml-1">{item.squareFeet} sq ft</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="home-outline" size={18} color="#666" />
              <Text className="text-gray-700 ml-1 capitalize">{item.type}</Text>
            </View>
          </View>
          
          <View className="flex-row items-center mb-3">
            <Text className="text-xl font-bold text-indigo-600">${item.price}/mo</Text>
            <Text className="text-gray-500 text-xs ml-2">
              Last updated: {item.lastUpdated.toLocaleDateString()}
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
        {/* <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-white">My Properties</Text>
          <TouchableOpacity 
            className="bg-white bg-opacity-20 p-2 rounded-full"
            onPress={() => console.log('Add new property')}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View> */}
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-white rounded-lg px-3 py-2">
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
      </View>
      
      {/* Filter Options */}
      <View className="bg-white px-4 py-3 flex-row justify-between items-center">
        <View className="flex-row">
          <Text className="text-gray-700 font-medium">Status: </Text>
          <TouchableOpacity 
            onPress={() => console.log('Open status filter dropdown')}
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
            onPress={() => console.log('Open sort options dropdown')}
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
      
      {/* Property List */}
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
              Try adjusting your search or filters, or add a new property.
            </Text>
            <TouchableOpacity
              className="bg-indigo-600 px-4 py-2 rounded-lg mt-4"
              onPress={() => console.log('Add new property')}
            >
              <Text className="text-white font-medium">Add New Property</Text>
            </TouchableOpacity>
          </View>
        }
      />
      
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
                
                <View className="flex-row justify-end mt-4">
                  <TouchableOpacity
                    className="bg-gray-200 px-4 py-2 rounded-lg mr-2"
                    onPress={() => setStatusModalVisible(false)}
                  >
                    <Text className="text-gray-800 font-medium">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="bg-indigo-600 px-4 py-2 rounded-lg"
                    onPress={() => setStatusModalVisible(false)}
                  >
                    <Text className="text-white font-medium">Confirm</Text>
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