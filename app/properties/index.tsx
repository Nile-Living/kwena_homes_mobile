import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useStore, Property } from "@/store/useStore";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/supabaseClient";
import { useRouter, useNavigation } from "expo-router";
import MyPropertiesHeader from "@/components/MyPropertiesHeader";
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
  setOptions: (options: any) => void;
};

interface DisplayFeature {
  icon: any;
  value: string | number;
  library: string;
  label?: string;
}

const MyPropertiesPage: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | "all">(
    "all",
  );
  const [sortOption, setSortOption] = useState<
    "price" | "date" | "alphabetical"
  >("date");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

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

  const fetchUserProperties = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error: fetchErr } = await supabase
        .from("properties")
        .select("*")
        .eq("user_id", user.id);

      if (fetchErr) throw fetchErr;

      const propertiesWithStatus = await addStatusToProperties(data || []);
      setProperties(propertiesWithStatus);
      setError(null);
    } catch (err: any) {
      setError(
        err.message || "Failed to load your properties. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  const addStatusToProperties = async (
    propertiesData: any[],
  ): Promise<Property[]> => {
    const parsedProperties = propertiesData.map((p) => ({
      ...p,
      images: Array.isArray(p.images) ? p.images : [],
      details:
        typeof p.details === "string"
          ? JSON.parse(p.details)
          : p.details || {},
    }));
    try {
      let statusData: { property_id: string; status: PropertyStatus }[] = [];
      const { data, error: statusFetchError } = await supabase
        .from("property_status")
        .select("property_id, status")
        .in(
          "property_id",
          parsedProperties.map((prop) => prop.id),
        );

      if (statusFetchError) {
        if (
          (statusFetchError as any).message?.includes(
            'relation "public.property_status" does not exist',
          ) ||
          (statusFetchError as any).message?.includes(
            'relation "property_status" does not exist',
          )
        ) {
          await createPropertyStatusTable();
          statusData = parsedProperties.map((property) => ({
            property_id: property.id,
            status: DEFAULT_PROPERTY_STATUS,
          }));
        } else {
          throw statusFetchError;
        }
      } else {
        statusData = data as { property_id: string; status: PropertyStatus }[];
      }

      const statusMap = new Map(
        statusData.map((item) => [item.property_id, item.status]),
      );

      return parsedProperties.map((property) => ({
        ...(property as Property),
        status: (statusMap.get(property.id) ||
          DEFAULT_PROPERTY_STATUS) as PropertyStatus,
      }));
    } catch (err) {
      return parsedProperties.map((property) => ({
        ...(property as Property),
        status: DEFAULT_PROPERTY_STATUS as PropertyStatus,
      }));
    }
  };

  const createPropertyStatusTable = async () => {
    const { error } = await supabase.rpc("create_property_status_table_if_not_exists");
    if (error) {
      console.error("Error ensuring property_status table exists via RPC:", error);
    }
  };

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
          pathname: "/payments/promote",
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
    [router],
  );

  const handleAddProperty = useCallback(() => {
    router.push("/property/new");
  }, [router]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const updatePropertyStatus = async (
    id: string,
    newStatus: PropertyStatus,
  ) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("property_status").upsert(
        {
          property_id: id,
          status: newStatus,
          last_updated: new Date().toISOString(),
        },
        { onConflict: "property_id" },
      );

      if (error) throw error;

      setProperties(
        properties.map((property) =>
          property.id === id ? { ...property, status: newStatus } : property,
        ),
      );
      setStatusModalVisible(false);
      Alert.alert("Success", "Property status updated successfully");
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.message || "Failed to update property status. Please try again.",
      );
    }
  };

  const deleteImageFromStorage = async (imageUrl: string) => {
    try {
      const urlParts = imageUrl.split('/');
      const bucketAndPath = urlParts.slice(urlParts.indexOf('property-images')).join('/');
      const filePath = bucketAndPath.substring('property-images/'.length);

      if (!filePath) {
        return;
      }
      await supabase.storage
        .from("property-images")
        .remove([filePath]);

    } catch (error) {
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

      const { error: propertyError } = await supabase
        .from("properties")
        .delete()
        .eq("id", selectedProperty.id)
        .eq("user_id", user.id);

      if (propertyError) throw propertyError;

      const updatedLocalProperties = properties.filter(
        (property) => property.id !== selectedProperty.id,
      );
      setProperties(updatedLocalProperties);
      setIsDeleteModalVisible(false);
      setSelectedProperty(null);
      Alert.alert("Success", "Property deleted successfully");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to delete property. Please try again.");
    }
  };

  const getFilteredProperties = useCallback(() => {
    let filtered = [...properties];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.title.toLowerCase().includes(query) || p.location.toLowerCase().includes(query));
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    switch (sortOption) {
      case 'price': filtered.sort((a, b) => (a.price ?? 0) - (b.price ?? 0)); break;
      case 'date': filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
      case 'alphabetical': filtered.sort((a, b) => a.title.localeCompare(b.title)); break;
    }
    return filtered;
  }, [properties, searchQuery, statusFilter, sortOption]);

  const getStatusDetails = (status: PropertyStatus): StatusOption => {
    return (
      statusOptions.find((option) => option.value === status) ||
      statusOptions[0]
    );
  };

  const getDisplayFeatures = useCallback((property: Property): DisplayFeature[] => {
    const features: DisplayFeature[] = [];
    const details = property.details || {};
    switch (property.category?.toLowerCase()) {
      case "house": case "apartment": case "lodge":
        if (details.bedrooms) features.push({ icon: "bed-outline", value: details.bedrooms, library: "Ionicons" });
        if (details.bathrooms) features.push({ icon: "water-outline", value: details.bathrooms, library: "Ionicons" });
        if (details.garages) features.push({ icon: "car-outline", value: details.garages, library: "Ionicons" });
        break;
      case "land": case "farm":
        if (details.size_sqm) features.push({ icon: "resize-outline", value: `${details.size_sqm} sqm`, library: "Ionicons" });
        if (details.road_access === true) features.push({ icon: "car-outline", value: "Road Access", library: "Ionicons" });
        break;
      case "commercial": case "industrial":
        const type = details.property_type || property.category;
        if (type) features.push({ icon: "business-outline", value: type, library: "Ionicons" });
        if (details.square_meters) features.push({ icon: "resize-outline", value: `${details.square_meters} sqm`, library: "Ionicons" });
        if (details.parking_spaces) features.push({ icon: "car-outline", value: `${details.parking_spaces} Parking`, library: "Ionicons" });
        break;
      default:
        if (details.bedrooms) features.push({ icon: "bed-outline", value: details.bedrooms, library: "Ionicons" });
        if (details.bathrooms) features.push({ icon: "water-outline", value: details.bathrooms, library: "Ionicons" });
        if (details.size_sqm) features.push({ icon: "resize-outline", value: `${details.size_sqm} sqm`, library: "Ionicons" });
        break;
    }
    if (property.category) {
        features.push({ icon: "home-outline", value: property.category, library: "MaterialCommunityIcons" });
    }
    return features.slice(0, 4);
  }, []);

  useEffect(() => {
    fetchUserProperties();
  }, [user]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => (
        <MyPropertiesHeader
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onSearchClear={handleClearSearch}
          searchPlaceholder="Search my properties..."
          onAddPress={handleAddProperty}
          addTintColor={isDarkMode ? "#A5B4FC" : "#4F46E5"}
        />
      ),
    });
  }, [navigation, searchQuery, handleSearchChange, handleClearSearch, handleAddProperty, isDarkMode]);

  const renderProperty = ({ item }: { item: Property }) => {
    const statusDetails = getStatusDetails(item.status as PropertyStatus);
    const displayFeatures = getDisplayFeatures(item);
    const iconColor = isDarkMode ? "#94a3b8" : "#666";

    return (
      <View className="bg-white dark:bg-slate-800 rounded-xl shadow-sm mb-4 overflow-hidden border border-gray-100 dark:border-slate-700">
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
            style={{ backgroundColor: statusDetails.color + "E6" }}
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
          <View
            className={`absolute top-2 left-2 px-3 py-1 rounded-full ${
              item.property_type === "rent" ? "bg-amber-600" : "bg-emerald-700"
            }`}
          >
            <Text className="text-white font-medium capitalize text-xs">
              {item.property_type === "rent" ? "For Rent" : "For Sale"}
            </Text>
          </View>
        </View>

        <View className="p-4">
          <Text
            className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-1"
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text
            className="text-gray-600 dark:text-slate-400 mb-3"
            numberOfLines={1}
          >
            {item.location}
          </Text>

          <View className="flex-row justify-start items-center flex-wrap gap-x-4 gap-y-1 mb-3">
            {displayFeatures.map((feature, index) => (
              <View key={index} className="flex-row items-center">
                {feature.library === "Ionicons" && (
                  <Ionicons name={feature.icon as any} size={18} color={iconColor} />
                )}
                {feature.library === "FontAwesome" && (
                  <FontAwesome name={feature.icon as any} size={16} color={iconColor} />
                )}
                {feature.library === "MaterialCommunityIcons" && (
                  <MaterialCommunityIcons name={feature.icon as any} size={18} color={iconColor} />
                )}
                <Text className="text-gray-700 dark:text-slate-300 ml-1 capitalize">
                  {feature.value}
                </Text>
              </View>
            ))}
            {displayFeatures.length <= 1 &&
              !["house", "apartment", "lodge"].includes(
                item.category?.toLowerCase() ?? "",
              ) && (
                <Text className="text-xs text-gray-500 dark:text-slate-500 italic">
                  (More details not specified)
                </Text>
              )}
          </View>

          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              K{item.price?.toLocaleString() ?? "N/A"}
              {item.property_type === "rent" && (
                <Text className="text-sm font-normal text-gray-600 dark:text-slate-400">
                  /mo
                </Text>
              )}
            </Text>
            <Text className="text-gray-500 dark:text-slate-500 text-xs">
              Posted: {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>

          <View className="flex-row flex-wrap border-t border-gray-100 dark:border-slate-700 pt-3 -mx-4 px-4">
            {propertyActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                className={`py-2 px-3 rounded-full mr-2 mb-2 flex-row items-center ${
                  action.label === "Delete Listing"
                    ? "bg-red-100 dark:bg-red-900/50"
                    : action.label === "Change Status"
                    ? "bg-indigo-100 dark:bg-indigo-900/50"
                    : "bg-gray-100 dark:bg-slate-700"
                }`}
                onPress={() => action.action(item)}
              >
                <Ionicons
                  name={action.icon as any}
                  size={16}
                  color={
                    action.label === "Delete Listing"
                      ? isDarkMode ? "#F87171" : "#DC2626"
                      : action.label === "Change Status"
                      ? isDarkMode ? "#818CF8" : "#4F46E5"
                      : isDarkMode ? "#94A3B8" : "#4B5563"
                  }
                />
                <Text
                  className={`ml-1 text-xs font-medium ${
                    action.label === "Delete Listing"
                      ? "text-red-600 dark:text-red-400"
                      : action.label === "Change Status"
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-gray-600 dark:text-slate-300"
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
    <View className="flex-1 bg-gray-50 dark:bg-slate-900">
      <View className="bg-white dark:bg-slate-800 px-4 py-3 flex-row justify-between items-center border-b border-gray-200 dark:border-slate-700">
        <View className="flex-row">
          <Text className="text-gray-700 dark:text-slate-300 font-medium">
            Status:{" "}
          </Text>
          <TouchableOpacity
            onPress={() => {
              const currentIndex = statusOptions.findIndex(
                (option) => option.value === statusFilter,
              );
              const nextStatus =
                statusFilter === "all"
                  ? statusOptions[0].value
                  : currentIndex < statusOptions.length - 1
                  ? statusOptions[currentIndex + 1].value
                  : "all";
              setStatusFilter(nextStatus as PropertyStatus | "all");
            }}
            className="flex-row items-center"
          >
            <Text className="text-indigo-600 dark:text-indigo-400 font-medium">
              {statusFilter === "all"
                ? "All Properties"
                : getStatusDetails(statusFilter).label}
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={isDarkMode ? "#818CF8" : "#4F46E5"}
            />
          </TouchableOpacity>
        </View>

        <View className="flex-row">
          <Text className="text-gray-700 dark:text-slate-300 font-medium">
            Sort by:{" "}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setSortOption(
                sortOption === "date"
                  ? "price"
                  : sortOption === "price"
                  ? "alphabetical"
                  : "date",
              );
            }}
            className="flex-row items-center"
          >
            <Text className="text-indigo-600 dark:text-indigo-400 font-medium">
              {sortOption === "date"
                ? "Newest"
                : sortOption === "price"
                ? "Price"
                : "A-Z"}
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={isDarkMode ? "#818CF8" : "#4F46E5"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {loading && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator
            size="large"
            color={isDarkMode ? "#818CF8" : "#4F46E5"}
          />
          <Text className="mt-4 text-gray-600 dark:text-slate-400">
            Loading your properties...
          </Text>
        </View>
      )}

      {error && !loading && (
        <View className="flex-1 justify-center items-center p-4">
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={isDarkMode ? "#F87171" : "#EF4444"}
          />
          <Text className="mt-4 text-gray-800 dark:text-slate-200 text-lg font-medium text-center">
            {error}
          </Text>
          <TouchableOpacity
            className="mt-4 bg-indigo-600 dark:bg-indigo-500 px-4 py-2 rounded-lg"
            onPress={fetchUserProperties}
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={getFilteredProperties()}
          renderItem={renderProperty}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center p-8 mt-10">
              <Ionicons
                name="home-outline"
                size={64}
                color={isDarkMode ? "#475569" : "#D1D5DB"}
              />
              <Text className="text-gray-400 dark:text-slate-500 text-lg font-medium mt-4 text-center">
                No properties found
              </Text>
              <Text className="text-gray-400 dark:text-slate-500 text-center mt-2">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters."
                  : "You haven't added any properties yet."}
              </Text>
              <TouchableOpacity
                className="bg-indigo-600 dark:bg-indigo-500 px-4 py-2 rounded-lg mt-6"
                onPress={() => router.push("/property/new")}
              >
                <Text className="text-white font-medium">Add New Property</Text>
              </TouchableOpacity>
            </View>
          }
          onRefresh={fetchUserProperties}
          refreshing={loading}
        />
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={statusModalVisible}
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white dark:bg-slate-800 rounded-t-xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800 dark:text-slate-100">
                Change Property Status
              </Text>
              <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDarkMode ? "#94A3B8" : "#6B7280"}
                />
              </TouchableOpacity>
            </View>

            {selectedProperty && (
              <>
                <Text className="text-gray-600 dark:text-slate-400 mb-4">
                  Select a new status for "{selectedProperty.title}"
                </Text>

                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    className={`flex-row items-center p-3 rounded-lg mb-2 ${
                      selectedProperty.status === option.value
                        ? "bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700"
                        : "border border-gray-200 dark:border-slate-600"
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
                          ? "text-indigo-700 dark:text-indigo-300"
                          : "text-gray-700 dark:text-slate-300"
                      }`}
                    >
                      {option.label}
                    </Text>
                    {selectedProperty.status === option.value && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={isDarkMode ? "#818CF8" : "#4F46E5"}
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={isDeleteModalVisible}
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white dark:bg-slate-800 rounded-xl p-6 m-4 w-11/12 max-w-md">
            <View className="items-center mb-4">
              <Ionicons
                name="warning-outline"
                size={48}
                color={isDarkMode ? "#F87171" : "#EF4444"}
              />
              <Text className="text-xl font-bold text-gray-800 dark:text-slate-100 mt-3">
                Delete Property
              </Text>
            </View>

            {selectedProperty && (
              <>
                <Text className="text-gray-600 dark:text-slate-400 mb-6 text-center">
                  Are you sure you want to delete "{selectedProperty.title}"?
                  This action cannot be undone.
                </Text>

                <View className="flex-row justify-center mt-2 space-x-3">
                  <TouchableOpacity
                    className="flex-1 bg-gray-200 dark:bg-slate-700 px-4 py-3 rounded-lg items-center"
                    onPress={() => setIsDeleteModalVisible(false)}
                  >
                    <Text className="text-gray-800 dark:text-slate-200 font-medium">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-red-600 dark:bg-red-500 px-4 py-3 rounded-lg items-center"
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
