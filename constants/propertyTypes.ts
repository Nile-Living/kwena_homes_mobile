export interface PropertyTypeDetails {
  label: string;
  hasBedBath: boolean;
  amenities: readonly string[];
  hasGaragesParkings?: boolean;
  hasSquareMeters?: boolean;
  hasLandDetails?: boolean;
  hasCommercialDetails?: boolean;
  hasFarmDetails?: boolean;
  hasIndustrialDetails?: boolean;
  hasFeatures?: boolean; // Added flag for features dropdown
}

export const PROPERTY_TYPES = {
  house: {
    label: "House",
    hasBedBath: true,
    amenities: [
      "Boundary Wall",
      "Garden",
      "Garage",
      "Pool",
      "Security Gate",
      "Staff Quarters",
      "24hr Security",
      "Parking",
      "Fibre Internet",
      "Road Access",
      "Air Conditioning",
      "Security",
      "Borehole",
    ],
    hasGaragesParkings: true,
    hasSquareMeters: false,
    hasLandDetails: false,
    hasCommercialDetails: false,
    hasFeatures: true,
  },
  apartment: {
    label: "Apartment",
    hasBedBath: true,
    amenities: [
      "Boundary Wall",
      "Garden",
      "Garage",
      "Pool",
      "Security Gate",
      "Staff Quarters",
      "24hr Security",
      "Parking",
      "Fibre Internet",
      "Road Access",
      "Air Conditioning",
      "Security",
      "Borehole",
    ],
    hasGaragesParkings: false,
    hasSquareMeters: true,
    hasLandDetails: false,
    hasCommercialDetails: false,
    hasFeatures: true,
  },
  land: {
    label: "Vacant Land",
    hasBedBath: false,
    amenities: [
      "Boundary Wall",
      "Serviced Plot",
      "Road Access",
      "Water Connection",
      "Electricity",
      "Fenced",
      "Zoned",
      "Borehole",
      "Three Phase Power",
      "Irrigation",
      "Livestock Facilities",
      "Storage Sheds",
      "Loading Bay",
      "Security Gate",
      "Security",
    ],
    hasGaragesParkings: false,
    hasSquareMeters: false, // Land uses size_sqm, not for parking spaces picker
    hasLandDetails: true,
    hasCommercialDetails: false,
    hasFeatures: false,
  },
  commercial: {
    label: "Commercial",
    hasBedBath: false,
    amenities: [
      "Parking",
      "24hr Security",
      "Security Gate",
      "Electricity",
      "Water Connection",
      "Road Access",
      "Fibre Internet",
      "Zoned",
      "Loading Bay",
      "Fire Safety",
      "Air Conditioning",
      "Security",
      "Three Phase Power",
      "Heavy Duty Flooring",
      "Warehouse Space",
      "Conference Facilities",
      "Restaurant",
    ],
    hasGaragesParkings: false,
    hasSquareMeters: true,
    hasLandDetails: true, // For Legal Status
    hasCommercialDetails: true,
    hasFeatures: false,
  },
  farm: {
    label: "Farm",
    hasBedBath: false,
    amenities: [
      "Boundary Wall",
      "Fenced",
      "Borehole",
      "Water Connection",
      "Electricity",
      "Irrigation",
      "Storage Sheds",
      "Livestock Facilities",
      "Zoned",
      "Road Access",
      "Three Phase Power",
    ],
    hasGaragesParkings: false,
    hasSquareMeters: false, // Uses size_sqm
    hasLandDetails: true,
    hasCommercialDetails: false,
    hasFarmDetails: true,
    hasFeatures: false,
  },
  industrial: {
    label: "Industrial",
    hasBedBath: false,
    amenities: [
      "Electricity",
      "Three Phase Power",
      "Heavy Duty Flooring",
      "Loading Bay",
      "Road Access",
      "Warehouse Space",
      "Storage Sheds",
      "Security Gate",
      "24hr Security",
      "Security",
      "Zoned",
      "Fire Safety",
      "Parking",
    ],
    hasGaragesParkings: false,
    hasSquareMeters: true, // For area and parking spaces consistency
    hasLandDetails: true, // For Legal Status
    hasCommercialDetails: false,
    hasIndustrialDetails: true,
    hasFeatures: false,
  },
  lodge: {
    label: "Lodge",
    hasBedBath: true,
    amenities: [
      "Pool",
      "Garden",
      "Security Gate",
      "24hr Security",
      "Security",
      "Parking",
      "Balcony",
      "Water Connection",
      "Electricity",
      "Fibre Internet",
      "Restaurant",
      "Conference Facilities",
      "Game Viewing Deck",
    ],
    hasGaragesParkings: false,
    hasSquareMeters: false,
    hasLandDetails: false,
    hasCommercialDetails: false,
    hasFeatures: false,
  },
} as const satisfies Record<string, PropertyTypeDetails>;

export type PropertyCategory = keyof typeof PROPERTY_TYPES;

export const getAllAmenities = (): string[] => {
  const all = new Set<string>();
  (Object.values(PROPERTY_TYPES) as PropertyTypeDetails[]).forEach((type) => {
    type.amenities?.forEach((a) => all.add(a));
  });
  return Array.from(all).sort(); // Sort for consistent order
};

export const bedBathGarageOptions = ["Any", "1+", "2+", "3+", "4+", "5+"];
export const featureOptions = [
  "Any",
  "Self-contained",
  "Furnished",
  "Unfurnished",
  "Modern Fittings",
];
