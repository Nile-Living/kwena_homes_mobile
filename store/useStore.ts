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

export interface PropertyDetails {
  bedrooms?: number;
  bathrooms?: number;
  garages?: number;
  parkings?: number;
  amenities?: string[];
  size_sqm?: number;
  legal_status?: string;
  intended_use?: string;
  road_access?: boolean;
  water_supply?: string;
  electricity_available?: boolean;
  fenced?: boolean;
  square_meters?: number;
  parking_spaces?: number;
  security_features?: string[];
  property_type?: string;
}

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
  status?: string | null;
  last_updated?: string | null;
  details?: PropertyDetails | any;
  liked?: boolean;
  is_promoted?: boolean | null;
  user_id?: string | null;
  agent_id?: string | null;
  contact_phone_number?: string;
  contact_whatsapp_number?: string;
  use_phone_for_call?: boolean;
  use_whatsapp_for_message?: boolean;
}

export interface PropertyResponseDto {
  properties: Property[];
  total: number;
  page: number;
  pageSize: number;
}

interface PropertyState {
  properties: Property[]; // Changed back to array
  featuredProperties: Property[]; // Changed back to array
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
  getPropertyById: (id: string) => Property | undefined;
  updatePropertyInStore: (propertyId: string, updatedPropertyData: Partial<Property>) => void;
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
    const uniquePropertiesArray: Property[] = Array.from(uniquePropertiesMap.values());
    set({ properties: uniquePropertiesArray, error: null });
  },
  setFeaturedProperties: (propertiesToSet) => {
    const savedIds = get().savedProperties;
    const propertiesWithLiked = propertiesToSet.map((p) => ({
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

    let propertyToAddToDetails: Property | undefined =
      get().properties.find((p) => p.id === propertyId) ||
      get().featuredProperties.find((p) => p.id === propertyId);

    const newSavedDetails = isLiked
      ? currentSavedDetails.filter((p) => p.id !== propertyId)
      : [
          ...currentSavedDetails,
          propertyToAddToDetails || { id: propertyId },
        ].filter((p): p is Property => p?.id !== undefined);

    set({
      savedProperties: newSavedIds,
      savedPropertyDetails: newSavedDetails,
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
        Authorization: `Bearer ${token}`,
      };
      if (!isLiked) {
        headers["Content-Type"] = "application/json";
      }

      const response = await fetch(url, { method, headers, body });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Status: ${response.status}, Response: ${errorText}`);
      }
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

    const originalProperties = [...get().properties];
    const originalFeaturedProperties = [...get().featuredProperties];
    const originalSavedDetails = [...get().savedPropertyDetails];
    const originalSavedIds = [...get().savedProperties];

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
    } catch (err: any) {
      console.error("Error deleting property:", err);
      set({
        properties: originalProperties,
        featuredProperties: originalFeaturedProperties,
        savedPropertyDetails: originalSavedDetails,
        savedProperties: originalSavedIds,
        error: "Failed to delete property. Please try again.",
      });
    }
  },
  getPropertyById: (id: string): Property | undefined => {
    return get().properties.find(p => p.id === id) || get().featuredProperties.find(p => p.id === id);
  },
  updatePropertyInStore: (propertyId: string, updatedPropertyData: Partial<Property>) => {
    set((state) => ({
      properties: state.properties.map((p) =>
        p.id === propertyId ? { ...p, ...updatedPropertyData } : p
      ),
      featuredProperties: state.featuredProperties.map((p) =>
        p.id === propertyId ? { ...p, ...updatedPropertyData } : p
      ),
      savedPropertyDetails: state.savedPropertyDetails.map((p) =>
        p.id === propertyId ? { ...p, ...updatedPropertyData, liked: true } : p // Ensure liked is true for saved details
      ),
    }));
  }
}));
