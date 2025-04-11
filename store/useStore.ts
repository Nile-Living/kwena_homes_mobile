import { create } from "zustand";
import { useAuthStore } from "./authStore";
import { API_BASE_URL } from "@/constants/Config"; // Adjust import path

// Define the property status types used in both the UI and database
export type PropertyStatus =
  | "available"
  | "occupied"
  | "rented"
  | "off-market"
  | "under-maintenance"
  | "pending-approval";

export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  images: string[];
  coordinates?: { latitude: number; longitude: number };
  description?: string;
  property_type: "rent" | "sale";
  category: string;
  created_at: string;
  status?: string;
  last_updated?: string;
  details?: any;
  liked?: boolean; 
}

export interface PropertyResponseDto {
  properties: Property[];
  total: number;
  page: number;
  pageSize: number;
}

interface PropertyState {
  properties: Property[];
  savedProperties: string[];
  searchQuery: string;
  propertyTypeFilter: "all" | "rent" | "sale";
  loading: boolean;
  error: string | null;

  setProperties: (properties: Property[], pageNumber: number) => void;
  setSearchQuery: (query: string) => void;
  setPropertyTypeFilter: (filter: "all" | "rent" | "sale") => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSavedProperties: (savedIds: string[]) => void;
  fetchUserProperties: () => Promise<void>;
  fetchSavedProperties: () => Promise<void>;
  toggleSavedProperty: (propertyId: string) => Promise<void>;
  deleteProperty: (propertyId: string) => Promise<void>;
}

export const useStore = create<PropertyState>((set, get) => ({
  properties: [],
  savedProperties: [],
  searchQuery: "",
  propertyTypeFilter: "all",
  // statusFilter: "all",
  // sortOption: "date", // Or map from HomeScreen's sort state
  loading: false,
  error: null,

  setProperties: (newProperties: Property[], pageNumber: number) => {
    const currentProperties = get().properties;
    const savedIds = get().savedProperties;

    // Add 'liked' status to the new properties
    const newPropertiesWithLiked: Property[] = newProperties.map((p) => ({
      ...p,
      liked: savedIds.includes(p.id),
    }));

    // Combine properties: If it's page 1, start fresh. Otherwise, append.
    const combinedProperties: Property[] =
      pageNumber === 1
        ? newPropertiesWithLiked
        : [...currentProperties, ...newPropertiesWithLiked];

    // Deduplicate using a Map (keeps the last occurrence of each ID)
    const uniquePropertiesMap: Map<string, Property> = new Map();
    combinedProperties.forEach((p) => {
      uniquePropertiesMap.set(p.id, p);
    });

    // Convert the Map values back to an array
    const uniquePropertiesArray: Property[] = Array.from(uniquePropertiesMap.values());

    set({ properties: uniquePropertiesArray, error: null });
  },
  setSavedProperties: (savedIds) => {
    set({ savedProperties: savedIds });
    const currentProperties = get().properties;
    const updatedPropertiesWithLiked = currentProperties.map((p) => ({ ...p, liked: savedIds.includes(p.id) }));
    set({ properties: updatedPropertiesWithLiked });
  },
  setSearchQuery: (query) => set({ searchQuery: query }),
  setPropertyTypeFilter: (filter) => set({ propertyTypeFilter: filter }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // --- API Methods ---

  fetchUserProperties: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    set({ loading: true, error: null });
    try {
      // Assuming your backend GET /properties accepts a user_id query param
      const response = await fetch(
        `${API_BASE_URL}/properties?user_id=${user.id}`,
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch user properties (status: ${response.status})`,
        );
      }
      const data: PropertyResponseDto = await response.json();
      get().setProperties(data.properties || [], 1); // Use the setter to handle 'liked'
    } catch (err: any) {
      console.error("Error fetching user properties:", err);
      set({ error: "Failed to load your properties. Please try again later." });
    } finally {
      set({ loading: false });
    }
  },

  fetchSavedProperties: async () => {
    const token = useAuthStore.getState().session?.access_token;
    if (!token) {
      get().setSavedProperties([]); // Clear if not logged in
      return;
    }
    set({ loading: true }); // Use general loading state
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/saved-properties`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Status: ${response.status}, Response: ${errorText}`);
      }
      const data = await response.json();
      get().setSavedProperties(data.savedPropertyIds || []);
    } catch (error: any) {
      console.error("Error fetching saved properties:", error);
      set({ error: "Could not load saved properties." });
      get().setSavedProperties([]); // Clear on error
    } finally {
      set({ loading: false });
    }
  },

  toggleSavedProperty: async (propertyId: string) => {
    const token = useAuthStore.getState().session?.access_token;
    if (!token) {
      console.log("User not logged in to toggle save");
      return;
    }
    const isLiked = get().savedProperties.includes(propertyId);
    const currentSaved = get().savedProperties;
    // Optimistic UI update
    const newSavedProperties = isLiked
      ? currentSaved.filter((id) => id !== propertyId)
      : [...currentSaved, propertyId];
    get().setSavedProperties(newSavedProperties);
    set({ error: null }); // Clear previous errors

    try {
      const method = isLiked ? "DELETE" : "POST";
      // Use URL with param for DELETE
      const url = isLiked
        ? `${API_BASE_URL}/users/me/saved-properties/${propertyId}`
        : `${API_BASE_URL}/users/me/saved-properties`;
      const body = isLiked ? undefined : JSON.stringify({ propertyId });
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const response = await fetch(url, { method, headers, body });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Status: ${response.status}, Response: ${errorText}`);
      }
      // Success, optimistic update is correct
      console.log(`Property ${propertyId} ${isLiked ? "unsaved" : "saved"}`);
    } catch (error: any) {
      console.error("Error toggling saved property:", error);
      get().setSavedProperties(currentSaved); // Revert on error
      set({ error: `Failed to ${isLiked ? 'unsave' : 'save'} property.` });
    }
  },

  deleteProperty: async (propertyId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return; // Or handle error

    const currentProperties = get().properties;
    // Optimistic update (remove locally first)
    set({
      properties: currentProperties.filter((p) => p.id !== propertyId),
    });

    try {
      const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
        method: "DELETE",
        headers: {
          // Add Authorization header if needed
        },
      });

      if (!response.ok) {
        // Check for specific errors (e.g., 403 Forbidden, 404 Not Found)
        throw new Error(`Failed to delete property (status: ${response.status})`);
      }
      console.log(`Property ${propertyId} deleted successfully.`);
      // Remove from saved properties if it exists there too
      const currentSaved = get().savedProperties;
      if (currentSaved.includes(propertyId)) {
        set({
          savedProperties: currentSaved.filter((id) => id !== propertyId),
        });
      }
    } catch (err: any) {
      console.error("Error deleting property:", err);
      // Revert optimistic update
      set({ properties: currentProperties });
      set({ error: "Failed to delete property. Please try again." });
    }
  },
}));
