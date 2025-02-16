import { create } from "zustand";


interface Property {
    id: string;
    title: string;
    price: number;
    location: string;
    bedrooms: number;
    images: string[];
    liked?: boolean;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
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

export const useStore = create<PropertyState>((set) => ({
    properties: [],
    savedProperties: [],
    searchQuery: '',
    activeFilters: [],
    loading: false,
    error: null,

    setProperties: (properties) => set({ properties }),
    toggleSavedProperty: (propertyId) => 
        set((state) => ({
            savedProperties: state.savedProperties.includes(propertyId)
            ? state.savedProperties.filter(id => id !== propertyId)
            : [...state.savedProperties, propertyId]
        })),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setActiveFilters: (filters) => set({ activeFilters: filters }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error })
}))