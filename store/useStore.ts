// store/useStore.ts
import { create } from "zustand";
import { useAuthStore } from "./authStore";
import { API_BASE_URL } from "@/constants/Config";

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
  is_promoted?: boolean;
}

export interface PropertyResponseDto {
  properties: Property[];
  total: number;
  page: number;
  pageSize: number;
}

interface PropertyState {
  properties: Property[];
  featuredProperties: Property[];
  savedPropertyDetails: Property[];
  savedProperties: string[];
  searchQuery: string;
  propertyTypeFilter: "all" | "rent" | "sale";
  loading: boolean;
  loadingFeatured: boolean;
  loadingSaved: boolean;
  error: string | null;
  errorFeatured: string | null;
  errorSaved: string | null;
  setProperties: (properties: Property[], pageNumber: number) => void;
  setFeaturedProperties: (properties: Property[]) => void;
  setSavedPropertyDetails: (properties: Property[]) => void;
  setSearchQuery: (query: string) => void;
  setPropertyTypeFilter: (filter: "all" | "rent" | "sale") => void;
  setLoading: (loading: boolean) => void;
  setLoadingFeatured: (loading: boolean) => void;
  setLoadingSaved: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setErrorFeatured: (error: string | null) => void;
  setErrorSaved: (error: string | null) => void;
  setSavedProperties: (savedIds: string[]) => void;
  fetchFeaturedProperties: () => Promise<void>;
  fetchSavedProperties: () => Promise<void>;
  toggleSavedProperty: (propertyId: string) => Promise<void>;
  deleteProperty: (propertyId: string) => Promise<void>;
}

export const useStore = create<PropertyState>((set, get) => ({
  properties: [],
  featuredProperties: [],
  savedPropertyDetails: [],
  savedProperties: [],
  searchQuery: "",
  propertyTypeFilter: "all",
  loading: false,
  loadingFeatured: false,
  loadingSaved: false,
  error: null,
  errorFeatured: null,
  errorSaved: null,

  setProperties: (newProperties: Property[], pageNumber: number) => {
    const currentProperties = get().properties;
    const savedIds = get().savedProperties;
    const newPropertiesWithLiked: Property[] = newProperties.map((p) => ({
      ...p,
      liked: savedIds.includes(p.id),
    }));
    const combinedProperties: Property[] =
      pageNumber === 1
        ? newPropertiesWithLiked
        : [...currentProperties, ...newPropertiesWithLiked];
    const uniquePropertiesMap: Map<string, Property> = new Map();
    combinedProperties.forEach((p) => {
      uniquePropertiesMap.set(p.id, p);
    });
    const uniquePropertiesArray: Property[] = Array.from(
      uniquePropertiesMap.values(),
    );
    set({ properties: uniquePropertiesArray, error: null });
  },
  setFeaturedProperties: (properties) => {
    const savedIds = get().savedProperties;
    const propertiesWithLiked = properties.map((p) => ({
      ...p,
      liked: savedIds.includes(p.id),
    }));
    set({ featuredProperties: propertiesWithLiked, errorFeatured: null });
  },
  setSavedPropertyDetails: (properties) => {
    const propertiesWithLiked = properties.map((p) => ({ ...p, liked: true }));
    set({ savedPropertyDetails: propertiesWithLiked, errorSaved: null });
  },
  setSavedProperties: (savedIds) => {
    set({ savedProperties: savedIds });
    const currentProps = get().properties;
    const currentFeatured = get().featuredProperties;
    const currentSavedDetails = get().savedPropertyDetails;
    set({
      properties: currentProps.map((p) => ({
        ...p,
        liked: savedIds.includes(p.id),
      })),
      featuredProperties: currentFeatured.map((p) => ({
        ...p,
        liked: savedIds.includes(p.id),
      })),
      savedPropertyDetails: currentSavedDetails
        .filter((p) => savedIds.includes(p.id))
        .map((p) => ({ ...p, liked: true })),
    });
  },
  setSearchQuery: (query) => set({ searchQuery: query }),
  setPropertyTypeFilter: (filter) => set({ propertyTypeFilter: filter }),
  setLoading: (loading) => set({ loading }),
  setLoadingFeatured: (loading) => set({ loadingFeatured: loading }),
  setLoadingSaved: (loading) => set({ loadingSaved: loading }),
  setError: (error) => set({ error }),
  setErrorFeatured: (error) => set({ errorFeatured: error }),
  setErrorSaved: (error) => set({ errorSaved: error }),

  fetchFeaturedProperties: async () => {
    set({ loadingFeatured: true, errorFeatured: null });
    try {
      const response = await fetch(`${API_BASE_URL}/properties/promoted`);
      if (!response.ok) throw new Error("Failed to fetch featured properties");
      const data: Property[] = await response.json();
      get().setFeaturedProperties(data || []);
    } catch (err: any) {
      console.error("Error fetching featured properties:", err);
      set({ errorFeatured: "Could not load featured properties." });
    } finally {
      set({ loadingFeatured: false });
    }
  },

  fetchSavedProperties: async () => {
    const token = useAuthStore.getState().session?.access_token;
    if (!token) {
      get().setSavedPropertyDetails([]);
      get().setSavedProperties([]);
      return;
    }
    set({ loadingSaved: true, errorSaved: null });
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/me/saved-properties/details`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Status: ${response.status}, Response: ${errorText}`);
      }
      const data: Property[] = await response.json();
      get().setSavedPropertyDetails(data || []);
      get().setSavedProperties((data || []).map((p) => p.id));
    } catch (error: any) {
      console.error("Error fetching saved property details:", error);
      set({ errorSaved: "Could not load saved properties." });
      get().setSavedPropertyDetails([]);
    } finally {
      set({ loadingSaved: false });
    }
  },

  toggleSavedProperty: async (propertyId: string) => {
    const token = useAuthStore.getState().session?.access_token;
    if (!token) return;

    const isLiked = get().savedProperties.includes(propertyId);
    const currentSavedIds = get().savedProperties;
    const currentSavedDetails = get().savedPropertyDetails;

    const newSavedIds = isLiked
      ? currentSavedIds.filter((id) => id !== propertyId)
      : [...currentSavedIds, propertyId];
    const newSavedDetails = isLiked
      ? currentSavedDetails.filter((p) => p.id !== propertyId)
      : [
          ...currentSavedDetails,
          get().properties.find((p) => p.id === propertyId) ||
            get().featuredProperties.find((p) => p.id === propertyId) || {
              id: propertyId,
            },
        ].filter((p) => p?.id);

    set({
      savedProperties: newSavedIds,
      savedPropertyDetails: newSavedDetails as Property[],
    });
    get().setSavedProperties(newSavedIds);
    set({ error: null, errorSaved: null });

    try {
      const method = isLiked ? "DELETE" : "POST";
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
      console.log(`Property ${propertyId} ${isLiked ? "unsaved" : "saved"}`);
      await get().fetchSavedProperties();
    } catch (error: any) {
      console.error("Error toggling saved property:", error);
      set({
        savedProperties: currentSavedIds,
        savedPropertyDetails: currentSavedDetails,
      });
      get().setSavedProperties(currentSavedIds);
      set({ errorSaved: `Failed to ${isLiked ? "unsave" : "save"} property.` });
    }
  },

  deleteProperty: async (propertyId: string) => {
    const token = useAuthStore.getState().session?.access_token;
    if (!token) {
      set({ error: "Authentication required to delete property." });
      return;
    }

    const originalState = {
      properties: [...get().properties],
      featuredProperties: [...get().featuredProperties],
      savedPropertyDetails: [...get().savedPropertyDetails],
      savedProperties: [...get().savedProperties],
    };

    set((state) => ({
      properties: state.properties.filter((p) => p.id !== propertyId),
      featuredProperties: state.featuredProperties.filter(
        (p) => p.id !== propertyId,
      ),
      savedPropertyDetails: state.savedPropertyDetails.filter(
        (p) => p.id !== propertyId,
      ),
      savedProperties: state.savedProperties.filter((id) => id !== propertyId),
      error: null,
    }));

    try {
      const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to delete property (status: ${response.status})`,
        );
      }
      console.log(`Property ${propertyId} deleted successfully.`);
    } catch (err: any) {
      console.error("Error deleting property:", err);
      set({
        ...originalState,
        error: "Failed to delete property. Please try again.",
      });
    }
  },
}));
