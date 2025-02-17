import { create } from "zustand";

interface Property {
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
}

export const useStore = create<PropertyState>((set, get) => ({
  properties: [],
  savedProperties: [],
  searchQuery: '',
  activeFilters: [],
  loading: false,
  error: null,

  setProperties: (properties) => set({ properties }),
  toggleSavedProperty: (propertyId) => {
    set((state) => {
      const updatedProperties = state.properties.map(property => {
        if (property.id === propertyId) {
          return { ...property, liked: !property.liked }; // Toggle liked status
        }
        return property;
      });
      return {
        properties: updatedProperties,
        savedProperties: updatedProperties.find(p => p.id === propertyId)?.liked
          ? [...state.savedProperties, propertyId]
          : state.savedProperties.filter(id => id !== propertyId),
      };
    });
  },
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveFilters: (filters) => set({ activeFilters: filters }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}))