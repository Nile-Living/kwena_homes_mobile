// useStore.ts

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
  loading: boolean;
  error: string | null;

  setProperties: (properties: Property[]) => void;
  toggleSavedProperty: (propertyId: string) => void;
  setSearchQuery: (query: string) => void;
  setActiveFilters: (filters: string[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchSavedProperties: () => Promise<void>;
}

export const useStore = create<PropertyState>((set, get) => ({
  properties: [],
  savedProperties: [],
  searchQuery: '',
  activeFilters: [],
  loading: false,
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
      set({ savedProperties: savedIds });
    } catch (error) {
      console.error('Error fetching saved properties:', error);
    }
  },
  toggleSavedProperty: async (propertyId) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const isLiked = get().savedProperties.includes(propertyId);
      
      if (isLiked) {
        await supabase
          .from('saved_properties')
          .delete()
          .match({ user_id: user.id, property_id: propertyId });
      } else {
        await supabase
          .from('saved_properties')
          .insert({ user_id: user.id, property_id: propertyId });
      }
      
      set(state => ({
        savedProperties: isLiked
          ? state.savedProperties.filter(id => id !== propertyId)
          : [...state.savedProperties, propertyId]
      }));
    } catch (error) {
      console.error('Error toggling saved property:', error);
    }
  },
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveFilters: (filters) => set({ activeFilters: filters }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}));