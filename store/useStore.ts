// useStore.ts - Updated Property Interface

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
  property_type: 'rent' | 'sale'; // Added property type
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
  }
}

interface PropertyState {
  properties: Property[];
  savedProperties: string[];
  searchQuery: string;
  activeFilters: string[];
  propertyTypeFilter: 'all' | 'rent' | 'sale'; // Added filter for property type
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
  
      // Update the local state immediately for a responsive UI
      set((state) => ({
        properties: state.properties.map((property) =>
          property.id === propertyId
            ? { ...property, liked: !isLiked } // Toggle the liked state
            : property
        ),
        savedProperties: isLiked
          ? state.savedProperties.filter((id) => id !== propertyId) // Remove if already liked
          : [...state.savedProperties, propertyId], // Add if not liked
      }));
  
      // Sync with Supabase
      if (isLiked) {
        // Remove from saved properties in Supabase
        await supabase
          .from("saved_properties")
          .delete()
          .match({ user_id: user.id, property_id: propertyId });
      } else {
        // Add to saved properties in Supabase
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