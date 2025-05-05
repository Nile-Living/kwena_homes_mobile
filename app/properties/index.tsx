import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  // TextInput,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useStore, Property } from "@/store/useStore";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/supabaseClient";
// import { useNavigation } from "@react-navigation/native";
import { useRouter, useNavigation } from "expo-router";
import HeaderAddButton from "@/components/HeaderAddButton";
import HeaderSearchBar from "@/components/HeaderSearchBar";

import {
  PropertyStatus,
  StatusOption,
  DEFAULT_PROPERTY_STATUS,
} from "@/utils/statusUtils";

interface PropertyAction {
  label: string;
  icon: string;
  action: (property: Property) => void;
}

type NavigationProps = {
  navigate: (screen: string, params?: { id: string }) => void;
  setOptions: (options: Partial<any>) => void;
};

interface DisplayFeature {
  icon:
    | React.ComponentProps<typeof Ionicons>["name"]
    | React.ComponentProps<typeof FontAwesome>["name"]
    | React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  value: string | number;
  library: "Ionicons" | "FontAwesome" | "MaterialCommunityIcons";
  label?: string;
}

// Component for My Properties Page
const MyPropertiesPage: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | "all">(
    "all"
  );
  const [sortOption, setSortOption] = useState<
    "price" | "date" | "alphabetical"
  >("date");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  // Status options with colors and icons
  const statusOptions: StatusOption[] = [
    {
      value: "available",
      label: "Available",
      color: "#4CAF50",
      icon: "checkmark-circle",
    },
    { value: "occupied", label: "Occupied", color: "#FF9800", icon: "home" },
    { value: "rented", label: "Rented Out", color: "#2196F3", icon: "cash" },
    {
      value: "off-market",
      label: "Off Market",
      color: "#9E9E9E",
      icon: "eye-off",
    },
    {
      value: "under-maintenance",
      label: "Under Maintenance",
      color: "#FFC107",
      icon: "construct",
    },
    {
      value: "pending-approval",
      label: "Pending Approval",
      color: "#673AB7",
      icon: "time",
    },
  ];

  const router = useRouter();

  // Fetch user's properties from Supabase
  const fetchUserProperties = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Query properties table where user_id matches current user
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      // Add status field to properties (create property_status table or use existing if available)
      const propertiesWithStatus = await addStatusToProperties(data);
      setProperties(propertiesWithStatus);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError("Failed to load your properties. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const addStatusToProperties = async (
    propertiesData: any[]
  ): Promise<Property[]> => {
    const parsedProperties = propertiesData.map((p) => ({
      ...p,
      details:
        typeof p.details === "string" ? JSON.parse(p.details) : p.details,
    }));
    try {
      let statusData: { property_id: string; status: PropertyStatus }[] = [];
      try {
        const { data, error } = await supabase
          .from("property_status")
          .select("property_id, status")
          .in(
            "property_id",
            propertiesData.map((p) => p.id)
          );
        if (error) throw error;
        statusData = data as { property_id: string; status: PropertyStatus }[];
      } catch (err: any) {
        if (err.message.includes('relation "property_status" does not exist')) {
          await createPropertyStatusTable();
          const statusEntries = parsedProperties.map((property) => ({
            property_id: property.id,
            status: DEFAULT_PROPERTY_STATUS,
            last_updated: new Date().toISOString(),
          }));
          await supabase.from("property_status").insert(statusEntries);
          statusData = statusEntries;
        } else {
          throw err;
        }
      }

      const statusMap = new Map(
        statusData.map((item) => [item.property_id, item.status])
      );

      return parsedProperties.map((property) => ({
        ...property,
        status: (statusMap.get(property.id) ||
          DEFAULT_PROPERTY_STATUS) as PropertyStatus,
      }));
    } catch (err) {
      console.error("Error adding status to properties:", err);
      return parsedProperties.map((property) => ({
        ...property,
        status: DEFAULT_PROPERTY_STATUS as PropertyStatus,
      }));
    }
  };

  // Create property_status table if it doesn't exist
  const createPropertyStatusTable = async () => {
    try {
      // Check if table exists first
      const { error: checkError } = await supabase
        .from("property_status")
        .select("count")
        .limit(1);

      if (checkError) {
        // Create the table using SQL
        const { error } = await supabase.rpc(
          "create_property_status_table",
          {}
        );

        if (error) throw error;
      }
    } catch (err) {
      console.error("Error creating property_status table:", err);
    }
  };

  // Property actions
  const propertyActions: PropertyAction[] = [
    {
      label: "Edit Details",
      icon: "create-outline",
      action: (property) => handleEditProperty(property),
    },
    {
      label: "Change Status",
      icon: "swap-horizontal-outline",
      action: (property) => {
        setSelectedProperty(property);
        setStatusModalVisible(true);
      },
    },
    {
      label: "View Inquiries",
      icon: "chatbubble-ellipses-outline",
      action: (property) =>
        Alert.alert(
          "Coming Soon",
          "This feature will be available in a future update."
        ),
    },
    {
      label: "Promote Listing",
      icon: "megaphone-outline",
      action: (property) =>
        router.push({
          pathname: "/payments/promote", // Your target route
          params: { propertyId: property.id, propertyTitle: property.title },
        }),
    },
    {
      label: "Delete Listing",
      icon: "trash-outline",
      action: (property) => {
        setSelectedProperty(property);
        setIsDeleteModalVisible(true);
      },
    },
  ];

  const handleEditProperty = useCallback(
    (property: Property) => {
      router.push(`/property/edit/${property.id}`);
    },
    [router]
  );

  const handlePromoteListing = useCallback(
    (property: Property) => {
      router.push({
        pathname: "/payments/promote",
        params: { propertyId: property.id, propertyTitle: property.title },
      });
    },
    [router]
  );

  const handleAddProperty = useCallback(() => {
    router.push("/property/new");
  }, [router]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // Update property status
  const updatePropertyStatus = async (
    id: string,
    newStatus: PropertyStatus
  ) => {
    if (!user) return;

    try {
      // Update status in property_status table
      const { error } = await supabase.from("property_status").upsert({
        property_id: id,
        status: newStatus,
        last_updated: new Date().toISOString(),
      });

      if (error) throw error;

      // Update local state
      setProperties(
        properties.map((property) =>
          property.id === id ? { ...property, status: newStatus } : property
        )
      );

      setStatusModalVisible(false);
      Alert.alert("Success", "Property status updated successfully");
    } catch (err) {
      console.error("Error updating property status:", err);
      Alert.alert(
        "Error",
        "Failed to update property status. Please try again."
      );
    }
  };

  const deleteImageFromStorage = async (imageUrl: string) => {
    try {
      const path = imageUrl.split("/").slice(-2).join("/");
      const { error } = await supabase.storage
        .from("property-images")
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      console.error(" Error deleting image from storage:", error);
    }
  };

  const handleDeleteProperty = async () => {
    if (!selectedProperty || !user) return;

    try {
      if (selectedProperty.images && selectedProperty.images.length > 0) {
        await Promise.all(
          selectedProperty.images.map((imageUrl) =>
            deleteImageFromStorage(imageUrl)
          )
        );
      }
      const { error: statusError } = await supabase
        .from("property_status")
        .delete()
        .eq("property_id", selectedProperty.id);

      if (statusError) throw statusError;

      const { error: savedError } = await supabase
        .from("saved_properties")
        .delete()
        .eq("property_id", selectedProperty.id);

      if (savedError) throw savedError;

      const { error: propertyError } = await supabase
        .from("properties")
        .delete()
        .eq("id", selectedProperty.id)
        .eq("user_id", user.id)
        .single();

      if (propertyError) throw propertyError;

      const updatedLocalProperties = properties.filter(
        (property) => property.id !== selectedProperty.id
      );
      setProperties(updatedLocalProperties);

      useStore.getState().setProperties(updatedLocalProperties, 1);

      setIsDeleteModalVisible(false);

      Alert.alert("Success", "Property deleted successfully");
    } catch (err) {
      console.error("Error deleting property:", err);
      Alert.alert("Error", "Failed to delete property. Please try again.");
    }
  };

  const getFilteredProperties = () => {
    let filtered = [...properties];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (property) =>
          property.title.toLowerCase().includes(query) ||
          property.location.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (property) => property.status === statusFilter
      );
    }

    switch (sortOption) {
      case "price":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "date":
        filtered.sort((a, b) => {
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });
        break;
      case "alphabetical":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return filtered;
  };

  const getStatusDetails = (status: PropertyStatus): StatusOption => {
    return (
      statusOptions.find((option) => option.value === status) ||
      statusOptions[0]
    );
  };

  const getDisplayFeatures = (property: Property): DisplayFeature[] => {
    const features: DisplayFeature[] = [];
    const details = property.details || {};

    switch (property.category?.toLowerCase()) {
      case "house":
      case "apartment":
      case "lodge":
        if (details.bedrooms)
          features.push({
            icon: "bed-outline",
            value: details.bedrooms,
            library: "Ionicons",
          });
        if (details.bathrooms)
          features.push({
            icon: "water-outline",
            value: details.bathrooms,
            library: "Ionicons",
          }); // Or 'bathtub' from FontAwesome
        if (details.garages)
          features.push({
            icon: "car-outline",
            value: details.garages,
            library: "Ionicons",
          });
        break;
      case "land":
      case "farm":
        if (details.size_sqm)
          features.push({
            icon: "resize-outline",
            value: `${details.size_sqm} sqm`,
            library: "Ionicons",
          });
        if (details.road_access === true)
          features.push({
            icon: "car-outline",
            value: "Road Access",
            library: "Ionicons",
          });
        // Add other relevant land/farm features if available in details
        break;
      case "commercial":
      case "industrial":
        // Use specific type from details if available, otherwise category
        const type = details.property_type || property.category;
        if (type)
          features.push({
            icon: "business-outline",
            value: type,
            library: "Ionicons",
          });
        if (details.square_meters)
          features.push({
            icon: "resize-outline",
            value: `${details.square_meters} sqm`,
            library: "Ionicons",
          });
        if (details.parking_spaces)
          features.push({
            icon: "car-outline",
            value: `${details.parking_spaces} Parking`,
            library: "Ionicons",
          });
        // Add other relevant commercial/industrial features
        break;
      default:
        // Fallback for unknown or generic categories
        if (details.bedrooms)
          features.push({
            icon: "bed-outline",
            value: details.bedrooms,
            library: "Ionicons",
          });
        if (details.bathrooms)
          features.push({
            icon: "water-outline",
            value: details.bathrooms,
            library: "Ionicons",
          });
        if (details.size_sqm)
          features.push({
            icon: "resize-outline",
            value: `${details.size_sqm} sqm`,
            library: "Ionicons",
          });
        break;
    }

    // Always add the general category type as a feature
    features.push({
      icon: "home-outline", // Using MaterialCommunityIcons for this one
      value: property.category || "Property",
      library: "MaterialCommunityIcons",
    });

    // Limit the number of features displayed to avoid clutter (e.g., max 4)
    return features.slice(0, 4);
  };

  useEffect(() => {
    fetchUserProperties();
  }, [user]);

  useLayoutEffect(() => {
    navigation.setOptions({
      // Render the custom search bar component in the title area
      headerTitle: () => (
        <HeaderSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery("")}
        />
      ),
      // Render the custom add button on the right
      headerRight: (props: { tintColor?: string }) => (
        <HeaderAddButton
          onPress={handleAddProperty}
          tintColor={props.tintColor}
        />
      ),
      // Optional: Adjust header style if needed
      // headerStyle: { backgroundColor: '#FFFFFF' },
      headerTitleAlign: "left", // Align search bar left if desired
      // headerBackTitleVisible: false, // Hide back button text if needed
    });
  }, [navigation, searchQuery, router]);

  const renderProperty = ({ item }: { item: Property }) => {
    const statusDetails = getStatusDetails(item.status as PropertyStatus);
    const displayFeatures = getDisplayFeatures(item);

    const iconColor = "#666";

    return (
      <View className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden border border-gray-100">
        <View className="relative">
          <Image
            source={{
              uri:
                item.images?.[0] ||
                "https://via.placeholder.com/600x400.png?text=No+Image",
            }}
            className="w-full h-48"
            resizeMode="cover"
          />
          <View
            className="absolute top-2 right-2 px-3 py-1 rounded-full flex-row items-center"
            style={{ backgroundColor: statusDetails.color + "E6" }} // Added opacity
          >
            <Ionicons
              name={statusDetails.icon as any}
              size={16}
              color="white"
            />
            <Text className="text-white font-medium ml-1 text-xs">
              {statusDetails.label}
            </Text>
          </View>
          <View className="absolute top-2 left-2 bg-amber-600 px-3 py-1 rounded-full">
            <Text className="text-white font-medium capitalize text-xs">
              {item.property_type === "rent" ? "For Rent" : "For Sale"}
            </Text>
          </View>
        </View>

        {/* Property Details */}
        <View className="p-4">
          <Text
            className="text-xl font-bold text-gray-800 mb-1"
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text className="text-gray-600 mb-3" numberOfLines={1}>
            {item.location}
          </Text>

          <View className="flex-row justify-start items-center flex-wrap gap-x-4 gap-y-1 mb-3">
            {displayFeatures.map((feature, index) => (
              <View key={index} className="flex-row items-center">
                {feature.library === "Ionicons" && (
                  <Ionicons
                    name={feature.icon as any}
                    size={18}
                    color={iconColor}
                  />
                )}
                {feature.library === "FontAwesome" && (
                  <FontAwesome
                    name={feature.icon as any}
                    size={16}
                    color={iconColor}
                  />
                )}
                {feature.library === "MaterialCommunityIcons" && (
                  <MaterialCommunityIcons
                    name={feature.icon as any}
                    size={18}
                    color={iconColor}
                  />
                )}
                <Text className="text-gray-700 ml-1 capitalize">
                  {feature.value}
                </Text>
              </View>
            ))}
            {/* Show message if no specific features were found besides category */}
            {displayFeatures.length <= 1 &&
              !["house", "apartment", "lodge"].includes(
                item.category?.toLowerCase() ?? ""
              ) && (
                <Text className="text-xs text-gray-500 italic">
                  {" "}
                  (More details not specified)
                </Text>
              )}
          </View>
          {/* --- End Dynamic Features Section --- */}

          {/* Price and Date Row (Keep as is) */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-indigo-600">
              K{item.price?.toLocaleString() ?? "N/A"}
              {item.property_type === "rent" && (
                <Text className="text-sm font-normal text-gray-600">/mo</Text>
              )}
            </Text>
            <Text className="text-gray-500 text-xs">
              Posted: {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>

          {/* Action Buttons (Keep as is) */}
          <View className="flex-row flex-wrap border-t border-gray-100 pt-3 -mx-4 px-4">
            {propertyActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                className={`py-2 px-3 rounded-full mr-2 mb-2 flex-row items-center ${
                  action.label === "Delete Listing"
                    ? "bg-red-100"
                    : action.label === "Change Status"
                    ? "bg-indigo-100"
                    : "bg-gray-100"
                }`}
                onPress={() => action.action(item)}
              >
                <Ionicons
                  name={action.icon as any}
                  size={16}
                  color={
                    action.label === "Delete Listing"
                      ? "#DC2626"
                      : action.label === "Change Status"
                      ? "#4F46E5"
                      : "#4B5563"
                  }
                />
                <Text
                  className={`ml-1 text-xs font-medium ${
                    // Made text smaller
                    action.label === "Delete Listing"
                      ? "text-red-600"
                      : action.label === "Change Status"
                      ? "text-indigo-600"
                      : "text-gray-600"
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

      {/* Filter Options */}
      <View className="bg-white px-4 py-3 flex-row justify-between items-center">
        <View className="flex-row">
          <Text className="text-gray-700 font-medium">Status: </Text>
          <TouchableOpacity
            onPress={() => {
              // Create a modal for status filter or cycle through options
              const currentIndex = statusOptions.findIndex(
                (option) => option.value === statusFilter
              );
              const nextStatus =
                statusFilter === "all"
                  ? statusOptions[0].value
                  : currentIndex < statusOptions.length - 1
                  ? statusOptions[currentIndex + 1].value
                  : "all";
              setStatusFilter(nextStatus);
            }}
            className="flex-row items-center"
          >
            <Text className="text-indigo-600 font-medium">
              {statusFilter === "all"
                ? "All Properties"
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
                sortOption === "date"
                  ? "price"
                  : sortOption === "price"
                  ? "alphabetical"
                  : "date"
              );
            }}
            className="flex-row items-center"
          >
            <Text className="text-indigo-600 font-medium">
              {sortOption === "date"
                ? "Newest"
                : sortOption === "price"
                ? "Price"
                : "A-Z"}
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
          <Text className="mt-4 text-gray-800 text-lg font-medium text-center">
            {error}
          </Text>
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
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters."
                  : "You haven't added any properties yet."}
              </Text>
              <TouchableOpacity
                className="bg-indigo-600 px-4 py-2 rounded-lg mt-4"
                onPress={() => navigation.navigate("AddProperty")}
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
        animationType="fade"
        transparent={true}
        visible={statusModalVisible}
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white rounded-t-xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">
                Change Property Status
              </Text>
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
                        ? "bg-indigo-50 border border-indigo-200"
                        : "border border-gray-200"
                    }`}
                    onPress={() =>
                      updatePropertyStatus(selectedProperty.id, option.value)
                    }
                  >
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: option.color }}
                    >
                      <Ionicons
                        name={option.icon as any}
                        size={16}
                        color="white"
                      />
                    </View>
                    <Text
                      className={`text-base font-medium ${
                        selectedProperty.status === option.value
                          ? "text-indigo-700"
                          : "text-gray-700"
                      }`}
                    >
                      {option.label}
                    </Text>
                    {selectedProperty.status === option.value && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#4F46E5"
                        style={{ marginLeft: "auto" }}
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
              <Text className="text-xl font-bold text-gray-800 mt-2">
                Delete Property
              </Text>
            </View>

            {selectedProperty && (
              <>
                <Text className="text-gray-600 mb-4 text-center">
                  Are you sure you want to delete "{selectedProperty.title}"?
                  This action cannot be undone.
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
