
interface PropertyTypeDetails {
  label: string;
  hasBedBath: boolean;
  amenities: readonly string[]; // Use readonly string[] because of 'as const'
  // --- ADDED FLAGS ---
  hasGaragesParkings?: boolean; // Specific to house? Or also lodge/estate?
  hasSquareMeters?: boolean;    // For apt/comm/industrial?
  hasLandDetails?: boolean;     // For land/farm?
  hasCommercialDetails?: boolean; // For commercial
  hasFarmDetails?: boolean;       // Specific farm fields?
  hasIndustrialDetails?: boolean; // Specific industrial fields?
  // Add more flags if other categories have unique fields (e.g., hasLodgeDetails)
}

export const PROPERTY_TYPES = {
  house: {
    label: 'House',
    hasBedBath: true,
    amenities: ['Boundary Wall', 'Garden', 'Garage', 'Pool', 'Security Gate', 'Staff Quarters'],
    // --- ADDED FLAGS ---
    hasGaragesParkings: true, // Houses have garages/parkings fields
    hasSquareMeters: false,
    hasLandDetails: false,
    hasCommercialDetails: false,
  },
  apartment: {
    label: 'Apartment',
    hasBedBath: true,
    amenities: ['Parking', 'Elevator', '24hr Security', 'Balcony', 'Fibre Internet'],
     // --- ADDED FLAGS ---
    hasGaragesParkings: false, // Uses parking_spaces
    hasSquareMeters: true,    // Uses square_meters
    hasLandDetails: false,
    hasCommercialDetails: false,
  },
  land: {
    label: 'Vacant Land',
    hasBedBath: false,
    amenities: ['Serviced Plot', 'Road Access', 'Water Connection', 'Electricity', 'Fenced', 'Zoned'],
     // --- ADDED FLAGS ---
    hasGaragesParkings: false,
    hasSquareMeters: false, // Uses size_sqm
    hasLandDetails: true,   // Has specific land fields
    hasCommercialDetails: false,
  },
  commercial: {
    label: 'Commercial',
    hasBedBath: false, // Typically
    amenities: ['Parking', 'Loading Bay', 'Fire Safety', 'Air Conditioning', 'Elevator', 'Security'],
     // --- ADDED FLAGS ---
    hasGaragesParkings: false, // Uses parking_spaces
    hasSquareMeters: true,    // Uses square_meters
    hasLandDetails: false,
    hasCommercialDetails: true, // Has specific commercial fields (like property_type detail)
  },
  farm: {
    label: 'Farm',
    hasBedBath: false, // Or maybe true if farmhouse included? Adjust as needed.
    amenities: ['Borehole', 'Irrigation', 'Storage Sheds', 'Livestock Facilities', 'Road Access'],
     // --- ADDED FLAGS ---
    hasGaragesParkings: false, // Or true if farmhouse has garage?
    hasSquareMeters: false, // Uses size_sqm? Or specific farm size field?
    hasLandDetails: true,   // Shares some land details?
    hasCommercialDetails: false,
    hasFarmDetails: true,   // Add specific farm flags/fields if needed
  },
  industrial: {
    label: 'Industrial',
    hasBedBath: false,
    amenities: ['Three-Phase Power', 'Loading Bay', 'Warehouse Space', 'Heavy Duty Flooring'],
     // --- ADDED FLAGS ---
    hasGaragesParkings: false, // Uses parking_spaces? Or specific loading bays?
    hasSquareMeters: true,    // Uses square_meters?
    hasLandDetails: false,
    hasCommercialDetails: false, // Or true if similar fields?
    hasIndustrialDetails: true, // Add specific industrial flags/fields if needed
  },
  lodge: {
    label: 'Lodge',
    hasBedBath: true, // Assumes lodges have rooms/baths
    amenities: ['Pool', 'Restaurant', 'Conference Facilities', 'Game Viewing Deck'],
     // --- ADDED FLAGS ---
    hasGaragesParkings: true, // Assumes parking/garages available
    hasSquareMeters: false, // Or maybe has plot size?
    hasLandDetails: false,
    hasCommercialDetails: false,
    // hasLodgeDetails: true, // Add specific lodge flags/fields if needed
  }
  // Add other categories like 'gated estate' if necessary
} as const satisfies Record<string, PropertyTypeDetails>; // Use satisfies for better type checking

// This type derivation remains correct
export type PropertyCategory = keyof typeof PROPERTY_TYPES;

// --- Keep Helper Functions ---

// Helper function to get all possible amenities
export const getAllAmenities = (): string[] => {
    const all = new Set<string>();
    (Object.values(PROPERTY_TYPES) as PropertyTypeDetails[]).forEach(type => { // Cast needed because of satisfies
        type.amenities?.forEach(a => all.add(a));
    });
    return Array.from(all);
};

// Define picker options separately
export const bedBathGarageOptions = ["Any", "1+", "2+", "3+", "4+", "5+"];
export const featureOptions = ["Any", "Self-contained", "Furnished", "Unfurnished", "Modern Fittings"]; // Keep or remove if features aren't used this way anymore
