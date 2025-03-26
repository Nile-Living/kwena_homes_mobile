import { create } from "zustand";
import { useAuthStore } from "./authStore";
import { supabase } from "@/supabaseClient";

// Define the property status types used in both the UI and database
export type PropertyStatus =
  | "available"
  | "occupied"
  | "rented"
  | "off-market"
  | "under-maintenance"
  | "pending-approval";

// Extend the Property interface to include an optional status field.
export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  images: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  description?: string;
  created_at: string;
  property_type: "rent" | "sale";
  category: string;
  garage: number;
  parkings: number;
  amenities: string[];
  security_features: string[];
}

interface PropertyState {
  properties: Property[];
  savedProperties: string[];
  searchQuery: string;
  activeFilters: string[];
  propertyTypeFilter: "all" | "rent" | "sale";
  statusFilter: PropertyStatus | "all";
  sortOption: "price" | "date" | "alphabetical";
  loading: boolean;
  error: string | null;

  setProperties: (properties: Property[]) => void;
  // Fetch properties owned by the current user and merge with status data
  fetchUserProperties: () => Promise<void>;
  // Fetch saved properties for the current user
  fetchSavedProperties: () => Promise<void>;
  toggleSavedProperty: (propertyId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setActiveFilters: (filters: string[]) => void;
  setPropertyTypeFilter: (filter: "all" | "rent" | "sale") => void;
  setStatusFilter: (filter: PropertyStatus | "all") => void;
  setSortOption: (option: "price" | "date" | "alphabetical") => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  // Update the status of a property both locally and in the database
  updatePropertyStatus: (propertyId: string, newStatus: PropertyStatus) => Promise<void>;
  // Delete a property from all related tables
  deleteProperty: (propertyId: string) => Promise<void>;

  // Helper functions to integrate the property_status table
  addStatusToProperties: (propertiesData: Property[]) => Promise<Property[]>;
  createPropertyStatusTable: () => Promise<void>;
}

export const useStore = create<PropertyState>((set, get) => ({
  properties: [],
  savedProperties: [],
  searchQuery: "",
  activeFilters: [],
  propertyTypeFilter: "all",
  statusFilter: "all",
  sortOption: "date",
  loading: false,
  error: null,

  setProperties: (properties) => set({ properties }),

  fetchUserProperties: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    try {
      set({ loading: true });
      // Fetch properties where user_id matches the logged-in user
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      // Merge property status from the property_status table
      const propertiesWithStatus = await get().addStatusToProperties(data);
      set({ properties: propertiesWithStatus, error: null });
    } catch (err) {
      console.error("Error fetching user properties:", err);
      set({ error: "Failed to load your properties. Please try again later." });
    } finally {
      set({ loading: false });
    }
  },

  addStatusToProperties: async (propertiesData: Property[]): Promise<Property[]> => {
    try {
      const { data: statusData, error } = await supabase
        .from("property_status")
        .select("property_id, status")
        .in("property_id", propertiesData.map((p) => p.id));
      if (error) throw error;
      if (statusData && statusData.length > 0) {
        const statusMap = new Map(
          (statusData as any[]).map((item) => [item.property_id, item.status])
        );
        return propertiesData.map((property) => ({
          ...property,
          status: statusMap.get(property.id) || "available",
        }));
      } else {
        // No status data found; create the table and insert default statuses
        await get().createPropertyStatusTable();
        const statusEntries = propertiesData.map((property) => ({
          property_id: property.id,
          status: "available",
          last_updated: new Date().toISOString(),
        }));
        await supabase.from("property_status").insert(statusEntries);
        return propertiesData.map((property) => ({
          ...property,
          status: "available",
        }));
      }
    } catch (err) {
      console.error("Error adding status to properties:", err);
      return propertiesData.map((property) => ({
        ...property,
        status: "available",
      }));
    }
  },

  createPropertyStatusTable: async () => {
    try {
      // Use the RPC function to create the table if it does not exist
      const { error } = await supabase.rpc("create_property_status_table", {});
      if (error) throw error;
    } catch (err) {
      console.error("Error creating property_status table:", err);
    }
  },

  fetchSavedProperties: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("saved_properties")
        .select("property_id")
        .eq("user_id", user.id);
      if (error) throw error;
      const savedIds = (data as any[]).map((item) => item.property_id);
      set((state) => ({
        savedProperties: savedIds,
        properties: state.properties.map((property) => ({
          ...property,
          liked: savedIds.includes(property.id),
        })),
      }));
    } catch (error) {
      console.error("Error fetching saved properties:", error);
    }
  },

  toggleSavedProperty: async (propertyId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    try {
      const isLiked = get().savedProperties.includes(propertyId);
      set((state) => ({
        properties: state.properties.map((property) =>
          property.id === propertyId ? { ...property, liked: !isLiked } : property
        ),
        savedProperties: isLiked
          ? state.savedProperties.filter((id) => id !== propertyId)
          : [...state.savedProperties, propertyId],
      }));
      if (isLiked) {
        await supabase
          .from("saved_properties")
          .delete()
          .match({ user_id: user.id, property_id: propertyId });
      } else {
        await supabase
          .from("saved_properties")
          .insert({ user_id: user.id, property_id: propertyId });
      }
    } catch (error) {
      console.error("Error toggling saved property:", error);
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveFilters: (filters) => set({ activeFilters: filters }),
  setPropertyTypeFilter: (filter) => set({ propertyTypeFilter: filter }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setSortOption: (option) => set({ sortOption: option }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  updatePropertyStatus: async (propertyId: string, newStatus: PropertyStatus) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    try {
      // Upsert the new status into the property_status table
      const { error } = await supabase
        .from("property_status")
        .upsert({
          property_id: propertyId,
          status: newStatus,
          last_updated: new Date().toISOString(),
        });
      if (error) throw error;
      // Update local state with the new status
      set((state) => ({
        properties: state.properties.map((property) =>
          property.id === propertyId ? { ...property, status: newStatus } : property
        ),
      }));
    } catch (err) {
      console.error("Error updating property status:", err);
    }
  },

  deleteProperty: async (propertyId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    try {
      // Delete the status entry (if exists)
      await supabase.from("property_status").delete().eq("property_id", propertyId);
      // Delete any saved property reference
      await supabase.from("saved_properties").delete().eq("property_id", propertyId);
      // Delete the property itself (ensure it belongs to the current user)
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", propertyId)
        .eq("user_id", user.id);
      if (error) throw error;
      // Update local state by removing the deleted property
      set((state) => ({
        properties: state.properties.filter((property) => property.id !== propertyId),
      }));
    } catch (err) {
      console.error("Error deleting property:", err);
    }
  },
}));
