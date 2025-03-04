import { create } from "zustand";
import { useAuthStore } from "./authStore";
import { supabase } from "@/supabaseClient";

export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  property_type: 'rent' | 'sale';
  user_id: string;
  liked?: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  description?: string;
  agent?: {
    name: string;
    phone: string;
    email?: string;
  };
  category: string;
  garages: number;
  parkings: number;
  amenities: string[];
  security_features: string[];
}

interface PropertyState {
  properties: Property[];
  savedProperties: string[];
  searchQuery: string;
  activeFilters: string[];
  propertyTypeFilter: 'all' | 'rent' | 'sale';
  loading: boolean;
  error: string | null;

  setProperties: (properties: Property[]) => void;
  toggleSavedProperty: (propertyId: string) => void;
  setSearchQuery: (query: string) => void;
  setActiveFilters: (filters: string[]) => void;
  setPropertyTypeFilter: (filter: 'all' | 'rent' | 'sale') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchSavedProperties: () => Promise<void>;
}

export const useStore = create<PropertyState>((set, get) => ({
  properties: [],
  savedProperties: [],
  searchQuery: '',
  activeFilters: [],
  propertyTypeFilter: 'all',
  loading: true,
  error: null,

  setProperties: (properties) => set({ properties }),
  fetchSavedProperties: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('saved_properties')
        .select('property_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const savedIds = data.map(item => item.property_id);
      set(state => ({
        savedProperties: savedIds,
        properties: state.properties.map(property => ({
          ...property,
          liked: savedIds.includes(property.id)
        }))
      }));
    } catch (error) {
      console.error('Error fetching saved properties:', error);
    }
  },
  toggleSavedProperty: async (propertyId) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
  
    try {
      const isLiked = get().savedProperties.includes(propertyId);
  
      set((state) => ({
        properties: state.properties.map((property) =>
          property.id === propertyId
            ? { ...property, liked: !isLiked }
            : property
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
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}));